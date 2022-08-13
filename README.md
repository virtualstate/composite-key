# `@virtualstate/memo`

[memo](https://github.com/tc39/proposal-function-memo) for JSX values. 

[//]: # (badges)

### Support

 ![Node.js supported](https://img.shields.io/badge/node-%3E%3D16.0.0-blue) ![Deno supported](https://img.shields.io/badge/deno-%3E%3D1.17.0-blue) ![Bun supported](https://img.shields.io/badge/bun-%3E%3D0.1.8-blue) 

### Test Coverage

 ![100%25 lines covered](https://img.shields.io/badge/lines-100%25-brightgreen) ![100%25 statements covered](https://img.shields.io/badge/statements-100%25-brightgreen) ![100%25 functions covered](https://img.shields.io/badge/functions-100%25-brightgreen) ![100%25 branches covered](https://img.shields.io/badge/branches-100%25-brightgreen)

[//]: # (badges)

## Usage 

```typescript jsx
import { memo } from "@virtualstate/memo";
import { descendants } from "@virtualstate/focus";
import { Component, Body } from "./somewhere";

const tree = memo(
    <>
        <Component />
        <main>
            <Body />
        </main>
    </>
);

// On the first usage, the tree will be memo'd as it is read
console.log(await descendants(tree));

// Uses the memo'd version, Component & Body aren't called again
console.log(await descendants(tree));
```