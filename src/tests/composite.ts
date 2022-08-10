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
    ok(key === compositeKey(random));
    ok(compositeKey(random) === compositeKey(random));
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
}