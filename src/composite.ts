import {isLike, ok} from "@virtualstate/focus";

function createCompositeValue<T>(fn: (parts: unknown[]) => T) {
    const keys = new Map<number, Map<unknown, unknown>>();

    function getExisting(map: Map<unknown, unknown>, parts: unknown[]): unknown {
        return parts.reduce(
            (map, next) => {
                if (map instanceof Map) {
                    return map.get(next)
                }
                return undefined;
            },
            map
        );
    }

    return function compositeValue(parts: unknown[]): T {
        const { length } = parts;
        let map = keys.get(length);
        if (!map) {
            map = new Map();
            keys.set(length, map);
        }

        const found = getExisting(map, parts);
        if (isLike<T>(found)) {
            return found;
        }

        const target = parts.slice(0, -1).reduce(
            (map: Map<unknown, unknown>, key) => {
                const existing = map.get(key);
                if (existing instanceof Map) {
                    return existing;
                }
                const next = new Map();
                map.set(key, next);
                return next;
            },
            map
        )
        ok(target instanceof Map);
        const value = fn(parts);
        target.set(parts.at(-1), value);
        return value;
    }

}

export function createCompositeKey() {
    return createCompositeValue(() => Object.freeze({__proto__:null}));
}

export function createCompositeSymbol() {
    return createCompositeValue((parts) => {
        const last = parts.at(-1);
        if (typeof last === "string") {
            return Symbol.for(last);
        }
        return Symbol();
    });
}