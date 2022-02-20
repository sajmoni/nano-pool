type InternalObjectPool<T> = {
  inactive: T[]
  active: T[]
}

export type ObjectPool<T> = {
  take: () => T
  putBack: (object: T) => void
  putBackAll: () => void
}

export const createObjectPool = <T>(
  size: number,
  createObject: (index: number) => T,
): ObjectPool<T> => {
  const objectPool: InternalObjectPool<T> = {
    inactive: [],
    active: [],
  }

  for (let index = 0; index < size; index++) {
    const object = createObject(index)
    objectPool.inactive.push(object)
  }

  return {
    take: () => {
      const object = objectPool.inactive.pop()

      // TODO: Not sure if this should be done here, or the function should be able to return undefined
      // Or perhaps, there should be more items added to the pool if needed
      if (!object) {
        throw new Error('No available objects in object pool!')
      }

      objectPool.active.push(object)

      return object
    },
    putBack: (object) => {
      const index = objectPool.active.indexOf(object)
      objectPool.active.splice(index, 1)
      objectPool.inactive.push(object)
    },
    putBackAll: () => {
      for (const activeObject of objectPool.active) {
        objectPool.inactive.push(activeObject)
      }

      objectPool.active = []
    },
  }
}
