import {
  h,
  children,
  createFragment,
  descendants,
  ok,
} from "@virtualstate/focus";
import { memo } from "../memo";
import { anAsyncThing } from "@virtualstate/promise/the-thing";

export default 1;

{
  let called = 0;
  let otherCalled = 0;

  async function* Other() {
    otherCalled += 1;
    yield 1;
  }

  async function* Component() {
    called += 1;
    yield 1;
    yield 2;
    yield [1, 2];
    yield 3;
    yield <Other />;
    yield 1;
  }

  const node = memo(
    <>
      <Component />
      <Component />
    </>
  );

  console.log({ called, otherCalled });
  console.log(await children(node));
  console.log({ called, otherCalled });
  console.log(await children(node));
  console.log({ called, otherCalled });
  ok(called === 2);
  ok(otherCalled === 2);
}

{
  let called = 0;
  async function* Component() {
    called += 1;
    yield 1;
  }
  const node = memo(
    <>
      <a>
        <b />
        <Component />
      </a>
      <a>
        <b />
        <Component />
      </a>
    </>
  );

  console.log({ called });
  console.log(await descendants(node));
  console.log({ called });
  console.log(await descendants(node));
  console.log({ called });
  ok(called === 1);
}
{
  let called = 0;
  async function* Component() {
    called += 1;
    yield 1;
  }
  const node = memo(
    <>
      <a a>
        <b />
        <Component />
      </a>
      <a b c>
        <b />
        <Component />
      </a>
    </>
  );

  console.log({ called });
  console.log(await descendants(node));
  console.log({ called });
  console.log(await descendants(node));
  console.log({ called });
  ok(called === 2);
}

{
  let called = 0;
  async function* Component() {
    called += 1;
    yield 1;
  }
  const node = memo(
      <>
        <a c b>
          <b />
          <Component />
        </a>
        <a b c>
          <b />
          <Component />
        </a>
      </>
  );

  console.log({ called });
  console.log(await descendants(node));
  console.log({ called });
  console.log(await descendants(node));
  console.log({ called });
  ok(called === 1);
}

{
  const value = memo("value");
  ok(value === "value");
}

{
  let called = 0;
  async function* Component() {
    called += 1;
    yield 1;
  }
  const component = memo(<Component />);

  const node = memo(
    <>
      <a a>
        <b />
        {component}
      </a>
      <a c b>
        <b />
        {component}
      </a>
    </>
  );

  console.log({ called });
  console.log(await descendants(node));
  console.log({ called });
  console.log(await descendants(node));
  console.log({ called });
  ok(called === 1);
}
{
  const node = memo(
    <>
      <a a />
      <a c b>
        <b />
      </a>
    </>
  );

  console.log(await descendants(node));
  console.log(await descendants(node));
}
{
  const node = memo(
    <>
      <a a />
      {{
        name: "b",
        children: 1,
      }}
    </>
  );

  console.log(await descendants(node));
  console.log(await descendants(node));
}

{
  let called = 0;
  async function* Component() {
    called += 1;
    yield 1;
  }
  const node = memo(
      <>
        <a c b>
          <b />
          <Component />
        </a>
        <a b c>
          <b />
          <Component />
        </a>
      </>
  );

  let anotherCalled = 0;

  async function *Another(options?: Record<string, unknown>, input?: unknown) {
    anotherCalled += 1;
    yield <another {...options}>{input}</another>
  }

  const another = (
      <>
        <Another a>{node}</Another>
        <Another b>{node}</Another>
      </>
  )

  console.log({ called, anotherCalled });
  console.log(await descendants(another));
  console.log({ called, anotherCalled });
  ok(called === 1);
  ok<unknown>(anotherCalled === 2);
  console.log(await descendants(another));
  console.log({ called, anotherCalled });
  ok(called === 1);
  ok(anotherCalled === 4);
}

{
  let called = 0;
  const Component = memo(
      async function *(options, input) {
        called += 1;
        yield <component {...options}>{input}</component>
      }
  );

  const node = (
      <>
        <Component />
        <Component />
      </>
  );

  console.log({ called });
  console.log(await descendants(node));
  console.log({ called });
  console.log(await descendants(node));
  console.log({ called });
  ok(called === 1);

}
{
    let called = 0;
    const Component = memo(
        async function *(options, input) {
            called += 1;
            yield <component {...options}>{input}</component>
        }
    );

    const node = (
        <>
            <Component />
            <Component>
                <a />
            </Component>
        </>
    );

    console.log({ called });
    console.log(await descendants(node));
    console.log({ called });
    console.log(await descendants(node));
    console.log({ called });
    ok(called === 2);

}
{
    let called = 0;
    const Component = memo(
        async function *(options, input) {
            called += 1;
            yield <component {...options}>{input}</component>
        }
    );

    const node = (
        <>
            <Component>
                <a />
            </Component>
            <Component>
                <b />
            </Component>
        </>
    );

    console.log({ called });
    console.log(await descendants(node));
    console.log({ called });
    console.log(await descendants(node));
    console.log({ called });
    ok(called === 2);

}
{
    let called = 0;
    const Component = memo(
        async function *(options, input) {
            called += 1;
            yield <component {...options}>{input}</component>
        }
    );

    const node = (
        <>
            <Component>
                <a a />
            </Component>
            <Component>
                <a b c />
            </Component>
        </>
    );

    console.log({ called });
    console.log(await descendants(node));
    console.log({ called });
    console.log(await descendants(node));
    console.log({ called });
    ok(called === 2);

}


{
    let called = 0;
    const Component = memo(
        async function *(options, input) {
            called += 1;
            yield <component {...options}>{input}</component>
        }
    );

    const node = (
        <>
            <Component>
                <a c b />
            </Component>
            <Component>
                <a b c />
            </Component>
        </>
    );

    console.log({ called });
    console.log(await descendants(node));
    console.log({ called });
    console.log(await descendants(node));
    console.log({ called });
    ok(called === 1);

}

{
    let called = 0;
    const Component = memo(
        async function *(options, input) {
            called += 1;
            yield <component {...options}>{input}</component>
        }
    );

    const node = (
        <>
            <Component>
                <a c b />
            </Component>
            <Component>
                <b b c />
            </Component>
        </>
    );

    console.log({ called });
    console.log(await descendants(node));
    console.log({ called });
    console.log(await descendants(node));
    console.log({ called });
    ok(called === 2);

}


{
    let called = 0;
    const Component = memo(
        async function *(options, input) {
            called += 1;
            yield <component {...options}>{input}</component>
        }
    );

    const node = (
        <>
            <Component a>
                <a c b />
            </Component>
            <Component b>
                <a b c />
            </Component>
        </>
    );

    console.log({ called });
    console.log(await descendants(node));
    console.log({ called });
    console.log(await descendants(node));
    console.log({ called });
    ok(called === 2);

}
{
    let called = 0;
    const Component = memo(
        async function *(options, input) {
            called += 1;
            yield <component {...options}>{input}</component>
        }
    );

    const node = (
        <>
            <Component a>
                <a c b />
            </Component>
            <Component a>
                <a b c />
            </Component>
        </>
    );

    console.log({ called });
    console.log(await descendants(node));
    console.log({ called });
    console.log(await descendants(node));
    console.log({ called });
    ok(called === 1);

}


{
    let called = 0;
    const Component = memo(
        async function *(options, input) {
            called += 1;
            yield <component {...options}>{input}</component>
        }
    );

    const node = (
        <>
            <Component a>
                {1}
            </Component>
            <Component a>
                {1}
            </Component>
        </>
    );

    console.log({ called });
    console.log(await descendants(node));
    console.log({ called });
    console.log(await descendants(node));
    console.log({ called });
    ok(called === 1);

}
{
    let called = 0;
    const Component = memo(
        async function *(options, input) {
            called += 1;
            yield <component {...options}>{input}</component>
        }
    );

    const node = (
        <>
            <Component a>
                {1}
            </Component>
            <Component a>
                {2}
            </Component>
        </>
    );

    console.log({ called });
    console.log(await descendants(node));
    console.log({ called });
    console.log(await descendants(node));
    console.log({ called });
    ok(called === 2);

}

{

    let count = 0,
        another = 0;
    const original = {
        async *[Symbol.asyncIterator]() {
            count += 1;
            yield 1;
            yield 2;
        },
        another() {
            another += 1;
            return this;
        },
        value: 1
    };
    const result = memo(original);
    ok(result.another !== original.another);
    ok(result.value === 1);
    await anAsyncThing(result.another());
    await anAsyncThing(result.another());
    console.log({ count, another });
    ok(count === 1);
    ok(another === 1);
}

{
    let count = 0;
    const result = memo({
        async *[Symbol.asyncIterator]() {
            count += 1;
            yield 1;
            throw new Error()
        }
    });
    let error = await anAsyncThing(result).catch(error => error);
    ok(error instanceof Error);
    error = await anAsyncThing(result).catch(error => error);
    ok(error instanceof Error);
    ok(count === 1);
}