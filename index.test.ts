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

  const object1 = objectPool.take()
  expect(object1).toEqual({ id: 4, x: 0, y: 0 })
  expect(objectPool.take()).toEqual({ id: 3, x: 0, y: 0 })

  objectPool.putBack(object1)
  expect(objectPool.take()).toEqual({ id: 4, x: 0, y: 0 })
  expect(objectPool.take()).toEqual({ id: 2, x: 0, y: 0 })

  objectPool.putBackAll()
  expect(objectPool.take()).toEqual({ id: 2, x: 0, y: 0 })
})
