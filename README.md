<h1 align="center">
  nano-pool
</h1>
<h4 align="center">
    A tiny TypeScript object pool
</h4>

<div align="center">
  <img src="https://badgen.net/npm/v/nano-pool?icon=npm" />
  <img src="https://badgen.net/bundlephobia/minzip/nano-pool" />
</div>

Allows you to pre-instantiate objects of any kind.

## :sparkles: Features

- Written in TypeScript
- Zero dependencies

---

## :wrench: Example usage

`nano-pool` only has one export: `createObjectPool`.

```ts
import { createObjectPool } from 'nano-pool'

const poolSize = 10

const createObject = () => {
  const sprite = new Sprite()
  sprite.scale.set(4)
  return sprite
}

const objectPool = createObjectPool(poolSize, createObject)

const object1 = objectPool.take()
objectPool.putBack(object1)
objectPool.putBackAll()
```

### What happens if there are no more objects in the pool when `take` is called?

In development, an error will be thrown.

In production, a new object is created and added to the pool.

---

## :package: Install

**npm**

```
npm install nano-pool
```

**yarn**

```
yarn add nano-pool
```

---

## :newspaper: API

```ts
createObjectPool<T>(size: number, createObject: (index: number) => T): ObjectPool
```

```ts
type ObjectPool = {
  take: () => T
  putBack: (object: T) => void
  putBackAll: () => void
}
```

### size

The amount of objects to create.

### createObject

The function that will be used to create new objects.
