import {createCompositeKey, createCompositeSymbol} from "../composite";
import {ok} from "@virtualstate/focus";

{
    const compositeKey = createCompositeKey();

    ok(
        compositeKey([]) === compositeKey([])
    );
}
{
    const compositeKey = createCompositeKey();

    const random = Math.random();
    ok(
        compositeKey([random]) === compositeKey([random])
    );
}
{
    const compositeKey = createCompositeKey();

    const random = Math.random();
    const a = [random];
    const b = [random];
    const key = compositeKey(a);

    ok(typeof key === "object");
    ok(key === compositeKey(a));
    ok(key === compositeKey(b));
    ok(compositeKey(a) === compositeKey(b));
}


{
    const compositeSymbol = createCompositeSymbol();

    ok(
        compositeSymbol([]) === compositeSymbol([])
    );
}
{
    const compositeSymbol = createCompositeSymbol();

    const random = Math.random();
    ok(
        compositeSymbol([random]) === compositeSymbol([random])
    );
}
{
    const compositeSymbol = createCompositeSymbol();

    const random = Math.random();
    const a = [random];
    const b = [random];
    const key = compositeSymbol(a);

    ok(typeof key === "symbol");
    ok(key === compositeSymbol(a));
    ok(key === compositeSymbol(b));
    ok(compositeSymbol(a) === compositeSymbol(b));
}

{

    const compositeSymbol = createCompositeSymbol();

    const random = `${Math.random()}`;
    const a = [random];
    const b = [random];
    const key = compositeSymbol(a);

    ok(typeof key === "symbol");
    ok(key === compositeSymbol(a));
    ok(key === compositeSymbol(b));
    ok(compositeSymbol(a) === compositeSymbol(b));
    ok(Symbol.for(random) === key);
}