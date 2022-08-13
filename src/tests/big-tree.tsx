import {children, descendants, h, ok} from "@virtualstate/focus";
import {memo} from "../memo";

const base = Array.from({ length: 5 }, () => {
    return async function *Base() {
        yield 1;
        yield 2;
        yield 3;
        // yield 1;
        // yield 2;
        // yield 3;
        // yield 1;
        // yield 2;
        // yield 3;
        // yield 1;
        // yield 2;
        // yield 3;
    }
}).map(Node => <Node />);
const next1 = Array.from({ length: 5 }, () => {
    return async function *Next1(options: unknown, input?: unknown) {
        for await (const snapshot of children(input)) {
            yield snapshot.map(value => (<next>{value}</next>))
        }
    }
}).map(Node => <Node>{...base}</Node>);
const next2 = Array.from({ length: 15 }, () => {
    return async function *Next2(options: unknown, input?: unknown) {
        for await (const snapshot of children(input)) {
            yield snapshot.map(value => (<next>{value}</next>))
        }
    }
}).map(Node => <Node>{...next1}</Node>);
const top = Array.from({ length: 5 }, () => {
    return async function *Top(options: unknown, input?: unknown) {
        for await (const snapshot of children(input)) {
            yield snapshot.map(value => (<next>{value}</next>))
        }
    }
}).map(Node => <Node>{...next2}</Node>);

async function time<T>(fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
        return await fn();
    } finally {
        const end = Date.now();
        console.log(`Took ${(end - start) / 1000} seconds`);
    }
}
let snapshot = await time(() => descendants(top));
const expectedLength = snapshot.length;
console.log({ expectedLength });
ok(snapshot.length);
const cached = memo(top);
snapshot = await time(() => descendants(cached));
ok(snapshot.length === expectedLength)
await new Promise<void>(queueMicrotask);
snapshot = await time(() => descendants(cached));
ok(snapshot.length === expectedLength)
await new Promise<void>(queueMicrotask);
snapshot = await time(() => descendants(cached));
ok(snapshot.length === expectedLength);

{

    let seen = new Set();
    let total = 0;
    for await (const snapshot of descendants(top)) {
        // console.log(snapshot);
        total += snapshot.length;
        for (const value of snapshot) {
            seen.add(value);
        }
    }
    console.log(seen.size, total);
}

{

    let seen = new Set();
    let total = 0;
    for await (const snapshot of descendants(cached)) {
        // console.log(snapshot);
        total += snapshot.length;
        for (const value of snapshot) {
            seen.add(value);
        }
    }
    console.log(seen.size, total);
}
// for (let i = 0; i < 100; i += 1) {
//     await new Promise<void>(queueMicrotask);
//     await new Promise<void>(resolve => setTimeout(resolve, 100));
//     await time(() => descendants(cached));
// }