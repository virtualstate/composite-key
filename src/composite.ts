import { isLike, ok } from "./is";

type ObjectLike = object | Function;

function isObjectLike(value: unknown): value is ObjectLike {
    return !!(typeof value === "object" && value) || typeof value === "function";
}

class DoubleMap<T = unknown> {

    private objects: WeakMap<ObjectLike, T> | undefined;
    private values: Map<unknown, T> | undefined;

    get(parts: unknown[], fn: (parts: unknown[]) => T): T {
        const found = this.pick(parts);
        if (isLike<T>(found)) {
            return found;
        }
        return this.place(parts, fn(parts));
    }

    private getStored(key: unknown) {
        if (isObjectLike(key)) {
            return this.objects?.get(key);
        } else {
            return this.values?.get(key);
        }
    }

    private pick(parts: unknown[]): T {
        const [key, ...rest] = parts;
        const value = this.getStored(key);
        if (value instanceof DoubleMap) {
            return value.pick(rest);
        }
        return value;
    }

    private place(parts: unknown[], value: T): T {
        const target: unknown = parts.slice(0, -1).reduce(
            (map: DoubleMap, key) => {
                const existing = map.getStored(key);
                if (existing instanceof DoubleMap) {
                    return existing;
                }
                const next = new DoubleMap();
                map.set(key, next);
                return next;
            },
            this
        )
        ok(target instanceof DoubleMap);
        target.set(parts.at(-1), value);
        return value;
    }

    private set(key: unknown, value: T) {
        if (isObjectLike(key)) {
            if (!this.objects) {
                this.objects = new WeakMap();
            }
            this.objects.set(key, value);
        } else {
            if (!this.values) {
                this.values = new Map();
            }
            this.values.set(key, value);
        }
    }
}

function createCompositeValue<T>(fn: (parts: unknown[]) => T) {
    const keys = new Map<number, DoubleMap<T>>();
    return function compositeValue(...parts: unknown[]): T {
        const { length } = parts;
        let map = keys.get(length);
        if (!map) {
            map = new DoubleMap();
            keys.set(length, map);
        }
        return map.get(parts, fn);
    }

}


type CompositeObjectKey = Readonly<{ __proto__: null }>;

export function createCompositeKey() {
    return createCompositeValue((): CompositeObjectKey => Object.freeze({__proto__:null}));
}

export function createCompositeSymbol() {
    return createCompositeValue((parts) => {
        if (parts.length === 1 && typeof parts[0] === "string") {
            return Symbol.for(parts[0]);
        }
        return Symbol();
    });
}

export type CompositeKeyFn = ReturnType<typeof createCompositeKey>;
export type CompositeSymbolFn = ReturnType<typeof createCompositeSymbol>;

let internalCompositeKey: CompositeKeyFn | undefined = undefined;
let internalCompositeSymbol: CompositeSymbolFn | undefined = undefined;

export function compositeKey(...parts: unknown[]): CompositeObjectKey {
    if (!internalCompositeKey) {
        internalCompositeKey = createCompositeKey();
    }
    return internalCompositeKey(...parts);
}

export function compositeSymbol(...parts: unknown[]): symbol {
    if (!internalCompositeSymbol) {
        internalCompositeSymbol = createCompositeSymbol();
    }
    return internalCompositeSymbol(...parts);
}