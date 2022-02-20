import test from 'ava'

import { createObjectPool } from 'nano-pool'

const createObject = (id: number) => ({
  id,
  x: 0,
  y: 0,
})

test('createObjectPool', (t) => {
  const objectPool = createObjectPool(5, (index) => {
    return createObject(index)
  })

  const object1 = objectPool.take()
  t.deepEqual(object1, { id: 4, x: 0, y: 0 })
  t.deepEqual(objectPool.take(), { id: 3, x: 0, y: 0 })

  objectPool.putBack(object1)
  t.deepEqual(objectPool.take(), { id: 4, x: 0, y: 0 })
  t.deepEqual(objectPool.take(), { id: 2, x: 0, y: 0 })

  objectPool.putBackAll()
  t.deepEqual(objectPool.take(), { id: 2, x: 0, y: 0 })
})
