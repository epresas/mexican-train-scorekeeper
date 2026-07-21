interface StorageAdapter {
  isAvailable: boolean
  platform: 'ios-safari' | 'android-chrome' | 'desktop' | 'unknown'
  save: (key: string, value: string) => Promise<boolean>
  load: (key: string) => Promise<string | null>
  remove: (key: string) => Promise<boolean>
  onStorageFailed?: () => void
}

function getPlatform(): 'ios-safari' | 'android-chrome' | 'desktop' | 'unknown' {
  if (typeof navigator === 'undefined') return 'unknown'
  const ua = navigator.userAgent.toLowerCase()
  
  const isIOS = /ipad|iphone|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isSafari = /safari/.test(ua) && !/chrome|crios|android/.test(ua)
  const isAndroid = /android/.test(ua)
  const isChrome = /chrome|crios/.test(ua)
  
  if (isIOS && isSafari) return 'ios-safari'
  if (isAndroid && isChrome) return 'android-chrome'
  if (/windows|macintosh|linux/.test(ua) && !/mobile|android/.test(ua)) return 'desktop'
  return 'unknown'
}

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open('mexican_train_scorekeeper_db', 1)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('store')) {
          db.createObjectStore('store')
        }
      }
      request.onsuccess = () => {
        resolve(request.result)
      }
      request.onerror = () => {
        reject(request.error)
      }
    } catch (e) {
      reject(e)
    }
  })
}

function idbGet(key: string): Promise<string | null> {
  return openIndexedDB().then((db) => {
    return new Promise<string | null>((resolve, reject) => {
      try {
        const transaction = db.transaction('store', 'readonly')
        const store = transaction.objectStore('store')
        const request = store.get(key)
        request.onsuccess = () => {
          resolve(request.result || null)
        }
        request.onerror = () => {
          reject(request.error)
        }
      } catch (e) {
        reject(e)
      }
    })
  })
}

function idbSet(key: string, value: string): Promise<void> {
  return openIndexedDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const transaction = db.transaction('store', 'readwrite')
        const store = transaction.objectStore('store')
        const request = store.put(value, key)
        request.onsuccess = () => {
          resolve()
        }
        request.onerror = () => {
          reject(request.error)
        }
      } catch (e) {
        reject(e)
      }
    })
  })
}

function idbDelete(key: string): Promise<void> {
  return openIndexedDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const transaction = db.transaction('store', 'readwrite')
        const store = transaction.objectStore('store')
        const request = store.delete(key)
        request.onsuccess = () => {
          resolve()
        }
        request.onerror = () => {
          reject(request.error)
        }
      } catch (e) {
        reject(e)
      }
    })
  })
}

async function testIndexedDB(): Promise<boolean> {
  if (typeof indexedDB === 'undefined') {
    return false
  }
  try {
    await idbSet('__test_idb__', '1')
    const val = await idbGet('__test_idb__')
    await idbDelete('__test_idb__')
    return val === '1'
  } catch (e) {
    return false
  }
}

export function createStorageAdapter(): StorageAdapter {
  const platform = getPlatform()
  let isAvailable = true
  let mode: 'localstorage' | 'indexeddb' | 'memory' = 'localstorage'
  const inMemoryStore: Record<string, string> = {}

  let localStorageWorks = false
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const testKey = '__test_ls__'
      window.localStorage.setItem(testKey, '1')
      localStorageWorks = window.localStorage.getItem(testKey) === '1'
      window.localStorage.removeItem(testKey)
    }
  } catch (e) {
    localStorageWorks = false
  }

  const adapter: StorageAdapter = {
    isAvailable: true,
    platform,
    save: async (key: string, value: string): Promise<boolean> => {
      try {
        if (mode === 'localstorage') {
          window.localStorage.setItem(key, value)
          return true
        } else if (mode === 'indexeddb') {
          try {
            await idbSet(key, value)
            return true
          } catch (e) {
            mode = 'memory'
            adapter.isAvailable = false
            inMemoryStore[key] = value
            if (adapter.onStorageFailed) {
              adapter.onStorageFailed()
            }
            return true
          }
        } else {
          inMemoryStore[key] = value
          return true
        }
      } catch (err) {
        return false
      }
    },
    load: async (key: string): Promise<string | null> => {
      try {
        if (mode === 'localstorage') {
          return window.localStorage.getItem(key)
        } else if (mode === 'indexeddb') {
          try {
            return await idbGet(key)
          } catch (e) {
            mode = 'memory'
            adapter.isAvailable = false
            if (adapter.onStorageFailed) {
              adapter.onStorageFailed()
            }
            return inMemoryStore[key] ?? null
          }
        } else {
          return inMemoryStore[key] ?? null
        }
      } catch (err) {
        return null
      }
    },
    remove: async (key: string): Promise<boolean> => {
      try {
        if (mode === 'localstorage') {
          window.localStorage.removeItem(key)
          return true
        } else if (mode === 'indexeddb') {
          try {
            await idbDelete(key)
            return true
          } catch (e) {
            mode = 'memory'
            adapter.isAvailable = false
            delete inMemoryStore[key]
            if (adapter.onStorageFailed) {
              adapter.onStorageFailed()
            }
            return true
          }
        } else {
          delete inMemoryStore[key]
          return true
        }
      } catch (err) {
        return false
      }
    },
  }

  if (localStorageWorks) {
    mode = 'localstorage'
    adapter.isAvailable = true
  } else {
    if (typeof indexedDB !== 'undefined') {
      mode = 'indexeddb'
      adapter.isAvailable = true
      testIndexedDB().then((working) => {
        if (!working) {
          mode = 'memory'
          adapter.isAvailable = false
          if (adapter.onStorageFailed) {
            adapter.onStorageFailed()
          }
        }
      }).catch(() => {
        mode = 'memory'
        adapter.isAvailable = false
        if (adapter.onStorageFailed) {
          adapter.onStorageFailed()
        }
      })
    } else {
      mode = 'memory'
      adapter.isAvailable = false
    }
  }

  return adapter
}
