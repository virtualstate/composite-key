import {createCompositeKey, createCompositeSymbol} from "../composite";
import {ok} from "@virtualstate/focus";

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