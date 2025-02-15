type InternalObjectPool<T> = {
  inactive: T[]
  active: T[]
}

export type ObjectPool<T> = ReturnType<typeof createObjectPool<T>>

export type Options<T> = {
  /** Improves debug output */
  id?: string
  /** Called when object is released back into the pool
   *
   * Note: This is also called when the object is created, so that any reset logic can be shared
   */
  onRelease?: (object: T) => void
}

export const createObjectPool = <T>(
  size: number,
  createObject: (index: number) => T,
  options?: Options<T>,
) => {
  const objectPool: InternalObjectPool<T> = {
    inactive: [],
    active: [],
  }

  for (let index = 0; index < size; index++) {
    const object = createObject(index)
    if (options?.onRelease) {
      options?.onRelease(object)
    }
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
            `nano-pool: No available objects in object pool. Id: ${options?.id ? `"${options?.id}"` : '<not set>'}, Pool size: ${size}.`,
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
      import.meta.env.MODE === 'development' ?
        (object: T) => {
          const index = objectPool.active.indexOf(object)

          if (index === -1) {
            throw new Error(
              `nano-pool: You tried to release an already released object: ${JSON.stringify(
                object,
              )}`,
            )
          } else {
            if (options?.onRelease) {
              options?.onRelease(object)
            }
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
            if (options?.onRelease) {
              options?.onRelease(object)
            }
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
