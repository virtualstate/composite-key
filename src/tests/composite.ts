import {compositeKey, compositeSymbol, createCompositeKey, createCompositeSymbol} from "../composite";
import {ok} from "../is";

{
    const compositeKey = createCompositeKey();

    ok(
        compositeKey() === compositeKey()
    );
}
{
    const compositeKey = createCompositeKey();

    const random = Math.random();
    ok(
        compositeKey(random) === compositeKey(random)
    );
}

{
    const compositeKey = createCompositeKey();

    const value = {};
    const key = compositeKey(value);
    ok(value !== key);
    ok(compositeKey(value) === key);
    ok(compositeKey(value, value) === compositeKey(value, value));
    ok(compositeKey(value, value) !== compositeKey(value, Math.random()));
}
{
    const compositeKey = createCompositeKey();

    const random = Math.random();
    const key = compositeKey(random);

    ok(typeof key === "object");
    ok(Object.isFrozen(key));
    ok(key === compositeKey(random));
    ok(compositeKey(random) === compositeKey(random));
}
{
    const compositeKey = createCompositeKey();

    const a = Math.random();
    const b = Math.random();
    const key = compositeKey(a, b);

    ok(typeof key === "object");
    ok(key === compositeKey(a, b));
    ok(compositeKey(a, b) === compositeKey(a, b));
    ok(compositeKey(a, b) !== compositeKey(b, a));
}


{
    const compositeSymbol = createCompositeSymbol();

    ok(
        compositeSymbol() === compositeSymbol()
    );
}
{
    const compositeSymbol = createCompositeSymbol();

    const random = Math.random();
    ok(
        compositeSymbol(random) === compositeSymbol(random)
    );
}
{
    const compositeSymbol = createCompositeSymbol();

    const random = Math.random();
    const key = compositeSymbol(random);

    ok(typeof key === "symbol");
    ok(key === compositeSymbol(random));
    ok(compositeSymbol(random) === compositeSymbol(random));
}

{

    const compositeSymbol = createCompositeSymbol();

    const random = `${Math.random()}`;
    const key = compositeSymbol(random);

    ok(typeof key === "symbol");
    ok(key === compositeSymbol(random));
    ok(compositeSymbol(random) === compositeSymbol(random));
    ok(Symbol.for(random) === key);
    ok(key.description === random);
}
{

    const compositeSymbol = createCompositeSymbol();

    const a = `${Math.random()}`;
    const b = `${Math.random()}`;
    const key = compositeSymbol(a, b);

    ok(typeof key === "symbol");
    ok(key === compositeSymbol(a, b));
    ok(compositeSymbol(a, b) === compositeSymbol(a, b));
    ok(compositeSymbol(a, b) !== compositeSymbol(b, a));
    ok(Symbol.for(a) !== key);
    ok(Symbol.for(b) !== key);
    ok(key.description !== a);
    ok(key.description !== b);
}

{
    const a = `${Math.random()}`;
    const b = `${Math.random()}`;
    ok(compositeSymbol(a, b) === compositeSymbol(a, b));
    ok(compositeSymbol(a, b) !== compositeSymbol(b, a));
    ok(compositeKey(a, b) === compositeKey(a, b));
    ok(compositeKey(a, b) !== compositeKey(b, a));
}

// Readme
{
    {
        // import { compositeKey } from "@virtualstate/composite-key";

        const map = new WeakMap();

        const array = [1, 2, 3];

        map.set(compositeKey(array, 1), "Value");

        ok(map.get(compositeKey(array, 1)) === "Value"); // "Value"
        ok(!map.get(compositeKey(array, 2))); // undefined
    }
    {
        // import { compositeSymbol } from "@virtualstate/composite-key";

        const map = new Map();

        const array = [1, 2, 3];

        map.set(compositeSymbol(array, 1), "Value");

        ok(map.get(compositeSymbol(array, 1)) === "Value"); // "Value"
        ok(!map.get(compositeSymbol(array, 2))); // undefined
    }
}