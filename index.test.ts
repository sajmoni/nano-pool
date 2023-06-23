import { test, expect } from 'vitest'

import { createObjectPool } from './src'

const createObject = (id: number) => ({
  id,
  x: 0,
  y: 0,
})

test('createObjectPool', () => {
  const objectPool = createObjectPool(5, (index) => {
    return createObject(index)
  })

  const object1 = objectPool.get()
  expect(object1).toEqual({ id: 4, x: 0, y: 0 })
  expect(objectPool.get()).toEqual({ id: 3, x: 0, y: 0 })

  objectPool.release(object1)
  expect(objectPool.get()).toEqual({ id: 4, x: 0, y: 0 })
  expect(objectPool.get()).toEqual({ id: 2, x: 0, y: 0 })

  objectPool.releaseAll()
  expect(objectPool.get()).toEqual({ id: 2, x: 0, y: 0 })
})

test('No more objects in pool - dev', () => {
  // @ts-expect-error
  import.meta.env.MODE = 'development'

  // Throw an error
  const objectPool = createObjectPool(1, (index) => {
    return createObject(index)
  })
  expect(objectPool.get()).toEqual({ id: 0, x: 0, y: 0 })
  expect(objectPool.get).toThrowError()
})

test('No more objects in pool - prod', () => {
  // @ts-expect-error
  import.meta.env.MODE = 'production'

  // Create a new object
  const objectPool = createObjectPool(1, (index) => {
    return createObject(index)
  })
  expect(objectPool.get()).toEqual({ id: 0, x: 0, y: 0 })
  expect(objectPool.get()).toEqual({ id: 1, x: 0, y: 0 })
})
