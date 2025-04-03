import type { Ref } from "vue"


const Storage = {
  Local: localStorage,
  Session: sessionStorage,
}
type Mode = keyof typeof Storage

const commonCache = (mode: Mode, key: string, subKey: string) => {
  const storage = Storage[mode]
  const read = () => {
    return JSON.parse(storage.getItem(key) || '{}')
  }
  const write = (value: { [subKey: string]: any }) => {
    storage.setItem(key, JSON.stringify(value))
  }
  return {
    cache: (value: any) => {
      if (typeof value === 'boolean' || value || value === '') {
        const data = read()
        data[subKey] = value
        write(data)
      }
    },
    load: (model?: Ref<any>): any => {
      const value = read()[subKey]
      if (model) {
        model.value = value
      }
      return value
    },
  }
}

export const useSession = (key: string, subKey: string) => {
  return commonCache('Session', key, subKey);
}

export const useLocal = (key: string, subKey: string) => {
  return commonCache('Local', key, subKey);
}
export const useSessionCache = (subKey: string) => {
  return commonCache('Session', 'CacheData', subKey);
}

export const useLocalCache = (subKey: string) => {
  return commonCache('Local', 'CacheData', subKey);
}