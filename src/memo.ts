import {
  children,
  getChildrenFromRawNode, getNameKey, h, isFragment, isLike,
  isUnknownJSXNode,
  name, ok, possibleChildrenKeys,
  properties,
  raw,
} from "@virtualstate/focus";
import { Push } from "@virtualstate/promise";
import {isAsyncIterable} from "./is";
import {createCompositeKey} from "./composite";

function createMemoFn<A extends unknown[], T>(source: (...args: A) => T): (...args: A) => T {
  const cache = new WeakMap<object, T>();
  const compositeKey = createCompositeKey();

  return function (...args: A): T {
    const key = compositeKey(...args);
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
    return getCache(node)(node, ...getCacheKey(node), ...keys);
  };
}

function getPropertiesCacheKey(node: unknown) {
  return Object.entries(properties(node))
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .flat();
}

const CacheSeparator = Symbol.for("@virtualstate/memo/cache/separator");
const CacheChildSeparator = Symbol.for("@virtualstate/memo/cache/separator/child");

const getChildrenCacheKey = createMemoFn(function getChildrenCacheKey(node: unknown): unknown[] {
  const array = getChildrenFromRawNode(node);
  if (!(Array.isArray(array) && array.length)) return [];
  return array.flatMap(
      node => {
        if (!isUnknownJSXNode(node)) return [node, CacheChildSeparator];
        return [name(node), ...getCacheKey(node), CacheChildSeparator];
      }
  )
})

const getCacheKey = createMemoFn(function getCacheKey(source: unknown, input: unknown = source) {
  return [
    ...getPropertiesCacheKey(source),
    CacheSeparator,
    ...getChildrenCacheKey(input)
  ]
})

function createMemoComponentFunction(source: unknown) {
  const cache = createMemoContextFn((node) => memo(node));

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

const memoFn = createMemoFn((input?: unknown) => {
  const internalMemo = createMemoFn(map);
  const internalMemoNamed = createMemoFn(
      createNameMemo(map)
  );

  function map(input: unknown): unknown {
    if (!isUnknownJSXNode(input)) return input;

    if (typeof input === "function") {
      return createMemoComponentFunction(input);
    }

    if (isAsyncIterable(input)) {
      return createAsyncIterableMemo(input);
    }

    if (isFragment(input)) {
      return {
        async *[Symbol.asyncIterator]() {
          for await (const snapshot of children(input)) {
            yield snapshot.map((node) => internalMemoNamed(node));
          }
        }
      }
    }

    const node = raw(input);
    const array = getChildrenFromRawNode(node);
    // Must have a sync indexable tree, if not, ignore
    if (!(Array.isArray(array) && array.length)) return input;
    return h(name(node), properties(node), ...array.map(node => internalMemo(node)));
  }
  return internalMemo(input);
})

export function memo<F extends MemoComponentFn>(input: F): F;
export function memo<A extends AsyncIterable<unknown>>(input: A): A;
export function memo(input?: unknown): unknown
export function memo(input?: unknown): unknown {
  return memoFn(input);
}
