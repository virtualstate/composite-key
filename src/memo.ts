import {
  children,
  getChildrenFromRawNode,
  isUnknownJSXNode,
  name,
  properties,
  raw,
} from "@virtualstate/focus";
import { Push } from "@virtualstate/promise";

export interface Memo {
  children?: typeof children;
}

function createMemo<C, T>(
  input: (context: C, ...keys: unknown[]) => T
): (context: C, ...keys: unknown[]) => T {
  const cache = new Map<unknown[], T>();

  type A = unknown[];

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

  function call(context: C, key: A, args: A): T {
    const result = input(context, ...args);
    cache.set(key, result);
    return result;
  }

  return (context, ...args: unknown[]): T => {
    const key = getKey(args);
    const existing = cache.get(key);
    if (existing) return existing;
    return call(context, key, args);
  };
}

function createNameMemo<C, T>(
  input: (context: C, ...keys: unknown[]) => T
): (context: C, ...keys: unknown[]) => T {
  const nameCache = new Map<unknown, (context: C, ...keys: unknown[]) => T>();

  function getCache(node: unknown) {
    const key = name(node);
    const existing = nameCache.get(key);
    if (existing) return existing;
    const cache = createMemo(input);
    nameCache.set(key, cache);
    return cache;
  }

  function getCacheKey(node: unknown) {
    return [
      name(name),
      ...Object.entries(properties(node))
          .sort(([a], [b]) => (a < b ? -1 : 1))
          .flat(),
    ];
  }

  return (node, ...keys) => {
    return getCache(node)(node, ...getCacheKey(node), ...keys);
  };
}

export function memo(input?: unknown) {
  if (!isUnknownJSXNode(input)) return input;
  let target: Push<unknown[]> | undefined = undefined;

  const cache = createNameMemo((input: unknown) => {
    const node = raw(input);
    if (!isUnknownJSXNode(node)) return input;
    const array = getChildrenFromRawNode(node);
    // Must have a sync indexable tree, if not, ignore
    if (!(Array.isArray(array) && array.length)) return input;
    return {
      ...node,
      children: array.map(memo),
    };
  });

  return {
    async *[Symbol.asyncIterator]() {
      if (target) {
        return yield* target;
      }
      target = new Push<unknown[]>({
        keep: true,
      });
      for await (const snapshot of children(input)) {
        // When we use memo we assume we own the node object
        const yielding = snapshot.map((input) => cache(input));
        target.push(yielding);
        yield yielding;
      }
      target.close();
    },
  };
}
