type InternalObjectPool<T> = {
  inactive: T[]
  active: T[]
}

export type ObjectPool<T> = {
  get: () => T
  release: (object: T) => void
  releaseAll: () => void
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
    get: () => {
      const object = objectPool.inactive.pop()

      // No more objects in the pool
      if (!object) {
        throw new Error('No available objects in object pool!')
      }

      objectPool.active.push(object)

      return object
    },
    release: (object) => {
      const index = objectPool.active.indexOf(object)
      objectPool.active.splice(index, 1)
      objectPool.inactive.push(object)
    },
    releaseAll: () => {
      for (const activeObject of objectPool.active) {
        objectPool.inactive.push(activeObject)
      }

      objectPool.active = []
    },
  }
}
