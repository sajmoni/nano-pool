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
