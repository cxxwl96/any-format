import type { Ref } from "vue"


const Storage = {
  Local: localStorage,
  Session: sessionStorage,
}
type Mode = keyof typeof Storage

const commonCache = (mode: Mode, key: string) => {
  const storage = Storage[mode]
  const read = () => {
    return JSON.parse(storage.getItem("CacheData") || '{}')
  }
  const write = (value: { [key: string]: any }) => {
    storage.setItem("CacheData", JSON.stringify(value))
  }
  return {
    cache: (value: any) => {
      if (typeof value === 'boolean' || value || value === '') {
        const data = read()
        data[key] = value
        write(data)
      }
    },
    load: (model?: Ref<any>): any => {
      const value = read()[key]
      if (model) {
        model.value = value
      }
      return value
    },
  }
}

export const useSessionCache = (key: string) => {
  return commonCache('Session', key);
}

export const useLocalCache = (key: string) => {
  return commonCache('Local', key);
}