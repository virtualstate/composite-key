import {
  children,
  getChildrenFromRawNode, h,
  isUnknownJSXNode,
  name, ok, possibleChildrenKeys,
  properties,
  raw,
} from "@virtualstate/focus";
import { Push } from "@virtualstate/promise";
import {isAsyncIterable} from "./is";

function createMemoFn<A extends unknown[], T>(source: (...args: A) => T): (...args: A) => T {
  const cache = new Map<A, T>();
  function findKey(args: A) {
    for (const key of cache.keys()) {
      if (key.length !== args.length) continue;
      const match = key.every((value, index) => args[index] === value);
      if (match) return key;
    }
    return undefined;
  }
  function getKey(args: A): A {
    return findKey(args) ?? args;
  }
  return function (...args: A): T {
    const key = getKey(args);
    const existing = cache.get(key);
    if (existing) return existing;
    const result = source(...args);
    if (isAsyncIterable(result)) {
      const returning = createAsyncIterableMemo(result);
      ok<T>(returning);
      cache.set(key, returning);
      return returning;
    } else {
      cache.set(key, result);
      return result;
    }
  }
}

function createAsyncIterableMemo<T>(result: AsyncIterable<T>) {
  let target: Push<T> | undefined = undefined;
  async function *asyncIterable() {
    if (target) {
      return yield * target;
    }
    target = new Push<T>({
      keep: true // memo all pushed values
    });
    try {
      for await (const snapshot of result) {
        target.push(snapshot);
        yield snapshot;
      }
    } catch (error) {
      target.throw(error);
      throw await Promise.reject(error);
    }
    target.close();
  }

  ok(isUnknownJSXNode(result));

  const fnCache = new WeakMap<Function, Function>();

  return new Proxy(result, {
    get(target, p) {
      if (p === Symbol.asyncIterator) {
        const iterable = asyncIterable()
        return iterable[Symbol.asyncIterator].bind(iterable);
      }
      const value = result[p];
      if (typeof value !== "function") return value;
      const existing = fnCache.get(value);
      if (existing) return existing;
      const fn = createMemoFn(value.bind(result));
      fnCache.set(value, fn);
      return fn;
    }
  });
}

function createMemoContextFn<C, T>(
  input: (context: C, ...keys: unknown[]) => T
): (context: C, ...keys: unknown[]) => T {
  function point(...args: unknown[]) {
    void args;
    let value: T | undefined = undefined,
        has = false;
    function is(given: unknown): given is T {
      return has;
    }
    return function (context: C) {
      if (is(value)) {
        return value;
      }
      const returning = input(context);
      value = returning;
      has = true;
      return returning;
    }
  }
  const fn = createMemoFn(point);
  return (context, ...args): T => fn(...args)(context);
}

function createNameMemo<C, T>(
  input: (context: C, ...keys: unknown[]) => T,
  getNameKey = name
): (context: C, ...keys: unknown[]) => T {

  const nameCache = new Map<unknown, (context: C, ...keys: unknown[]) => T>();

  function getCache(node: unknown) {
    const key = getNameKey(node);
    const existing = nameCache.get(key);
    if (existing) return existing;
    const cache = createMemoContextFn(input);
    nameCache.set(key, cache);
    return cache;
  }

  return (node, ...keys) => {
    // Split the cache by node name to create quick partitions
    return getCache(node)(node, ...getPropertiesCacheKey(node), ...keys);
  };
}

function getPropertiesCacheKey(node: unknown) {
  return Object.entries(properties(node))
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .flat();
}

const childrenKeys = new Set<unknown>(possibleChildrenKeys);

const CacheSeparator = Symbol.for("@virtualstate/memo/cache/separator");
const CacheChildSeparator = Symbol.for("@virtualstate/memo/cache/separator/child");

function createMemoFunction(source: unknown) {
  const cache = createMemoContextFn((node) => memo(node));

  function getChildrenCacheKey(node: unknown): unknown[] {
    const array = getChildrenFromRawNode(node);
    if (!(Array.isArray(array) && array.length)) return [];
    return array.flatMap(
        node => {
          if (!isUnknownJSXNode(node)) return [node, CacheChildSeparator];
          return [name(node), ...getCacheKey(node, node), CacheChildSeparator];
        }
    )
  }

  function getCacheKey(source: unknown, input?: unknown) {
    return [
      ...getPropertiesCacheKey(source),
      CacheSeparator,
      ...getChildrenCacheKey(input)
    ]
  }

  return function *(options: Record<string | symbol, unknown>, input?: unknown) {
    const snapshotOptions = {
      ...properties(input),
      ...options
    };
    const key = getCacheKey({ options }, input);
    yield cache(
        h(source, snapshotOptions, input),
        ...key
    );
  }
}

type OptionsRecord = Record<string | symbol, unknown>
type PartialOptions = Partial<OptionsRecord>;

interface MemoComponentFn<O extends PartialOptions = PartialOptions, I = unknown, R = unknown> {
  (options: O, input?: I): R
}

const internalMemo = createMemoFn((input?: unknown) => {
  if (!isUnknownJSXNode(input)) return input;

  if (typeof input === "function") {
    return createMemoFunction(input);
  }

  if (isAsyncIterable(input)) {
    return createAsyncIterableMemo(input);
  }

  const cache = createNameMemo((input: unknown) => {
    const node = raw(input);
    if (!isUnknownJSXNode(node)) return input;
    const array = getChildrenFromRawNode(node);
    // Must have a sync indexable tree, if not, ignore
    if (!(Array.isArray(array) && array.length)) return input;
    return {
      ...Object.fromEntries(
          Object.entries(node)
              .filter(([key]) => !childrenKeys.has(key))
      ),
      children: array.map(memo),
    };
  });

  return {
    async *[Symbol.asyncIterator]() {
      for await (const snapshot of children(input)) {
        // When we use memo we assume we own the node object
        yield snapshot.map((input) => cache(input));
      }
    },
  };
})

export function memo<F extends MemoComponentFn>(input: F): F;
export function memo<A extends AsyncIterable<unknown>>(input: A): A;
export function memo(input?: unknown): unknown
export function memo(input?: unknown): unknown {
  return internalMemo(input);
}
