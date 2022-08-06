import {
  h,
  createFragment,
  children,
  descendants,
  ok,
} from "@virtualstate/focus";
import { memo } from "../memo";

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
