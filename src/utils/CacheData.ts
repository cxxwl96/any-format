import type { Ref } from "vue"

export const useCacheData = (key: string) => {
  const read = () => {
    return JSON.parse(sessionStorage.getItem("CacheData") || '{}')
  }
  const write = (value: { [key: string]: string }) => {
    sessionStorage.setItem("CacheData", JSON.stringify(value))
  }
  return {
    cache: (value: string) => {
      if (value) {
        const data = read()
        data[key] = value
        write(data)
      }
    },
    load: (model?: Ref<string>): string => {
      const value = read()[key] || ''
      if (model) {
        model.value = value
      }
      return value
    },
  }
}