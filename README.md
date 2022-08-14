# `@virtualstate/composite-key`

[compositeKey & compositeSymbol](https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey) implementation

[//]: # (badges)

### Support

 ![Node.js supported](https://img.shields.io/badge/node-%3E%3D16.0.0-blue) ![Deno supported](https://img.shields.io/badge/deno-%3E%3D1.17.0-blue) ![Bun supported](https://img.shields.io/badge/bun-%3E%3D0.1.8-blue) 

### Test Coverage

 ![100%25 lines covered](https://img.shields.io/badge/lines-100%25-brightgreen) ![100%25 statements covered](https://img.shields.io/badge/statements-100%25-brightgreen) ![100%25 functions covered](https://img.shields.io/badge/functions-100%25-brightgreen) ![100%25 branches covered](https://img.shields.io/badge/branches-100%25-brightgreen)

[//]: # (badges)

## Usage 

Allows for multiple values to be "joined" together and used as a single key.

## `compositeKey`

Returns a frozen object that can be used as a reference in place of the original arguments

The object can be used as a key in a WeakMap, or Map. The object can also be used in a WeakSet.

```typescript
import { compositeKey } from "@virtualstate/composite-key";

const map = new WeakMap();

const array = [1, 2, 3];

map.set(compositeKey(array, 1), "Value");

map.get(compositeKey(array, 1)); // "Value"
map.get(compositeKey(array, 2)); // undefined
```

## `compositeSymbol`

Returns a symbol that can be used as a reference in place of the original arguments. 

The symbol can be used in most places, including keys of objects, and Maps. The symbol can also be used in a Set. 

```typescript
import { compositeSymbol } from "@virtualstate/composite-key";

const map = new Map();

const array = [1, 2, 3];

map.set(compositeSymbol(array, 1), "Value");

map.get(compositeSymbol(array, 1)); // "Value"
map.get(compositeSymbol(array, 2)); // undefined
```

## `createCompositeKey`

Creates an isolated version of `compositeKey`

```typescript
import { createCompositeKey } from "@virtualstate/composite-key";

const compositeKey = createCompositeKey();

const array = [1, 2, 3];
compositeKey(array, 1); // An object
```


## `createCompositeSymbol`

Creates an isolated version of `compositeSymbol`

```typescript
import { createCompositeSymbol } from "@virtualstate/composite-key";

const compositeSymbol = createCompositeSymbol();

const array = [1, 2, 3];
compositeSymbol(array, 1); // A symbol
```

