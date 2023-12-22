import { test, expect, vi } from 'vitest'

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

test('Release already released object - dev', () => {
  // @ts-expect-error
  import.meta.env.MODE = 'development'
  const objectPool = createObjectPool(1, (index) => {
    return createObject(index)
  })

  // Throws an error
  const item = objectPool.get()
  objectPool.release(item)
  expect(() => objectPool.release(item)).toThrowError()
})

test('Release already released object - prod', () => {
  // @ts-expect-error
  import.meta.env.MODE = 'production'
  const objectPool = createObjectPool(1, (index) => {
    return createObject(index)
  })

  // No-op
  const item = objectPool.get()
  objectPool.release(item)
  const releaseSpy = vi.fn(objectPool.release)
  releaseSpy(item)
  expect(releaseSpy).toHaveReturned()
})
