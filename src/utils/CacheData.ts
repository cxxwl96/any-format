import type { Ref } from "vue"

const Storage = {
  Local: localStorage,
  Session: sessionStorage,
}
type Mode = keyof typeof Storage

const commonCache = (mode: Mode, key: string, subKey?: string) => {
  const storage = Storage[mode]
  const read = () => {
    return subKey ? JSON.parse(storage.getItem(key) || '{}') : null
  }
  const write = (value: { [subKey: string]: any } | any) => {
    storage.setItem(key, subKey ? JSON.stringify(value) : value)
  }
  return {
    cache: (value: any) => {
      if (typeof value === 'boolean' || value || value === '') {
        const data = read()
        if (subKey) {
          data[subKey] = value
        }
        write(data)
      }
    },
    load: (model?: Ref<any>): any => {
      let value: any
      if (subKey) {
        value = read()[subKey]
      } else {
        value = read()
      }
      if (model) {
        model.value = value
      }
      return value
    },
    clear: () => storage.clear()
  }
}

export const useSession = (key: string, subKey?: string) => {
  return commonCache('Session', key, subKey);
}

export const useLocal = (key: string, subKey?: string) => {
  return commonCache('Local', key, subKey);
}

export const useSessionCache = (subKey: string) => {
  return commonCache('Session', 'CacheData', subKey);
}

export const useLocalCache = (subKey: string) => {
  return commonCache('Local', 'CacheData', subKey);
}