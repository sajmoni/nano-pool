type InternalObjectPool<T> = {
  inactive: T[]
  active: T[]
}

export type ObjectPool<T> = ReturnType<typeof createObjectPool<T>>

export const createObjectPool = <T>(
  size: number,
  createObject: (index: number) => T,
) => {
  const objectPool: InternalObjectPool<T> = {
    inactive: [],
    active: [],
  }

  for (let index = 0; index < size; index++) {
    const object = createObject(index)
    objectPool.inactive.push(object)
  }

  /**
   * Returns the size of objects in and outside the pool
   */
  const countAll = () => {
    return objectPool.inactive.length + objectPool.active.length
  }

  return {
    get: () => {
      let object = objectPool.inactive.pop()

      // No more objects in the pool
      if (!object) {
        // This relies on vite being used as bundler
        if (import.meta.env.MODE === 'development') {
          throw new Error(
            `nano-pool: No available objects in object pool. Size of pool is ${size}.`,
          )
        } else {
          // @ts-expect-error
          console.warn('No more objects in pool - a new one was created')
          object = createObject(countAll())
        }
      }

      objectPool.active.push(object)

      return object
    },
    release:
      import.meta.env.MODE === 'development'
        ? (object: T) => {
            const index = objectPool.active.indexOf(object)

            if (index === -1) {
              throw new Error(
                `nano-pool: You tried to release an already released object: ${JSON.stringify(
                  object,
                )}`,
              )
            } else {
              objectPool.active.splice(index, 1)
              objectPool.inactive.push(object)
            }
          }
        : (object: T) => {
            const index = objectPool.active.indexOf(object)
            if (index === -1) {
              // No-op
            } else {
              objectPool.active.splice(index, 1)
              objectPool.inactive.push(object)
            }
          },
    releaseAll: () => {
      for (const activeObject of objectPool.active) {
        objectPool.inactive.push(activeObject)
      }

      objectPool.active = []
    },
    countAll,
  }
}
