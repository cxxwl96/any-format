import { computed, type Ref, ref } from 'vue'
import { stringify } from 'qs'
import { message, notification } from 'ant-design-vue'
// @ts-ignore
import { jsonlint } from '@/utils/jsonlint'
import { isArray, isBoolean, isJsonString, isObject, isString } from '@/utils/is'

type ClearType = 'null' | 'string' | 'boolean' | 'object' | 'array' | 'valueRegExp' | 'keyRegExp'
export type ClearOption = {
  title: string;
  key: ClearType;
  checked: boolean;
  case: string[];
  value?: string;
}

type JsonType = string | object | any
type JsonResult = {
  value: JsonType;
  error: boolean;
  message: string;
}
/**
 * JSONUtil
 *
 * @param json JSON
 */
export class JSONUtil {
  
  /**
   * 原始JSON
   */
  private originJson: Ref<JsonType>;

  /**
   * 计算结果
   */
  private result = computed<JsonResult>(() => {
    return { value: this.originJson, error: false, message: '' }
  })

  constructor(json: Ref<JsonType>) {
    this.originJson = json
  }

  /**
   * 获取原始JSON
   */
  private getOriginJson(): JsonType {
    return this.originJson.value
  }

  /**
   * 获取结果
   */
  private getResult = (): JsonResult => {
    return this.result.value
  }

  /**
   * 设置结果值
   * 
   * @param value 值
   */
  private setResultValue = (value: JsonType, updateOriginJson: boolean = true): void => {
    this.result.value.value = value
    // 更新入参值
    if (updateOriginJson) {
      this.originJson.value = value
    }
  }
  
  private error = (value: JsonType, message: string) => {
    this.result.value.value = value
    this.result.value.error = true
    this.result.value.message = message
    return this.result.value
  }
  
  private isError = () => {
    return this.result.value.error
  }

  /**
   * 格式化校验
   *
   * @param tip 是否提示
   * @param throwError 是否抛异常
   */
  public formatValidate = (tip: boolean = true, throwError?: boolean): JsonResult => {
    const value = this.getOriginJson()
    if (!value || value === '') {
      if (tip) {
        message.info('请输入内容')
      }
      return this.error('', '请输入内容')
    }
    try {
      const formatValue =
        jsonlint.parse(value) &&
        isString(value) ? JSON.stringify(JSON.parse(value), null, 4) : JSON.stringify(value, null, 4)
      this.setResultValue(formatValue)
    } catch (e: any) {
      if (e?.name === 'Error') {
        this.error(value as string, e?.message)
      }
      this.setResultValue(value as string)
    }
    if (tip) {
      if (this.isError()) {
        notification.error({
          message: 'JSON格式错误',
          description: this.getResult().message,
          placement: 'topRight'
        })
      } else {
        message.success('正确的JSON')
      }
    }
    if (throwError && this.isError()) {
      throw new Error(this.getResult().message)
    }
    return this.getResult()
  }

  /**
   * 压缩
   */
  public compress = (): JsonResult => {
    this.formatValidate()
    if (!this.isError()) {
      const value = JSON.stringify(JSON.parse(this.getOriginJson()))
      this.setResultValue(value)
    }
    return this.getResult()
  }

  /**
   * 深度去除转义
   *
   * @param suffix 是否带' [@String]'后缀
   */
  public deepDelEscape = (suffix: boolean): JsonResult => {
    const deepJsonForDelEscape = (json: Ref<any>, suffix: boolean) => {
      if (isArray(json.value)) {
        for (const obj of json.value) {
          deepJsonForDelEscape(ref(obj), suffix)
        }
      } else if (isObject(json.value)) {
        const suffixStr = ' [@String]'
        for (let key in json.value) {
          const value = json.value[key]
          if (isJsonString(value)) {
            delete json.value[key]
            key = suffix ? key + suffixStr : key
            json.value[key] = JSON.parse(value)
            deepJsonForDelEscape(ref(json.value[key]), suffix)
          } else {
            if (!suffix && key.endsWith(suffixStr)) {
              deepJsonForDelEscape(ref(value), suffix)
              delete json.value[key]
              json.value[key.substring(0, key.length - suffixStr.length)] = value
            } else {
              deepJsonForDelEscape(ref(value), suffix)
            }
          }
        }
      }
    }
    this.formatValidate()
    if (!this.isError()) {
      const value = ref(JSON.parse(this.getOriginJson()))
      deepJsonForDelEscape(value, suffix)
      this.setResultValue(JSON.stringify(value.value)) 
      this.formatValidate(false)
    }
    return this.getResult()
  }


  /**
   * 去除转义
   */
  public delEscape = (): JsonResult => {
    const value = this.getOriginJson() || ''
    this.setResultValue(value.replace(/\\"/g, '"'))
    return this.getResult()
  }

  /**
   * 转义
   */
  public escape = (): JsonResult => {
    const value = this.getOriginJson() || ''
    this.setResultValue(value.replace(/"/g, '\\"'))
    return this.getResult()
  }

  /**
   * 字段排序
   *
   * @param asc 是否升序
   */
  public fieldSort = (asc: boolean): JsonResult => {
    const deepFieldSort = (json: any, asc: boolean): any => {
      if (isArray(json)) {
        // set types: 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function'
        const set = new Set(json.map(item => typeof item))
        if (set.size > 1 || set.has('symbol') || set.has('undefined') || set.has('object') || set.has('function')) {
          const arr: any[] = []
          for (const item of json) {
            arr.push(deepFieldSort(item, asc))
          }
          return arr
        } else if (set.size === 1 && (set.has('string') || set.has('number') || set.has('bigint') || set.has('boolean'))) {
          return asc ? json.sort() : json.sort().reverse()
        }
      } else if (isObject(json)) {
        const sortedKeys = asc ? Object.keys(json).sort() : Object.keys(json).sort().reverse()
        const sortedObj: { [key: string]: any } = {}
        for (const key of sortedKeys) {
          if (isObject(json[key]) || isArray(json[key])) {
            sortedObj[key] = deepFieldSort(json[key], asc)
          } else {
            sortedObj[key] = json[key]
          }
        }
        return sortedObj
      }
      return json
    }
    this.formatValidate()
    if (!this.isError()) {
      const json = JSON.parse(this.getOriginJson())
      this.setResultValue(JSON.stringify(deepFieldSort(json, asc))) 
      this.formatValidate(false)
    }
    return this.getResult()
  }

  /**
   * JSON清理
   *
   * @param options 清理选项
   */
  public clearJson = (options: ClearOption[]): JsonResult => {
    const deepClearJson = (json: any) => {
      if (isArray(json)) {
        for (const item of json) {
          deepClearJson(item)
          if (toDelete(null, item)) {
            delete json[item]
          }
        }
      } else if (isObject(json)) {
        for (const key in json) {
          deepClearJson(json[key])
          if (toDelete(key, json[key])) {
            delete json[key]
          }
        }
      }
      if (toDelete(null, json)) {
        return ''
      }
      return json
    }

    const clearChecked = (key: ClearType): boolean => {
      return (options.find(op => op.key === key)?.checked || false)
    }

    const clearValue = (key: ClearType): string => {
      return (options.find(op => op.key === key)?.value || '')
    }

    const toDelete = (key: string | null, value: any): boolean => {
      if (key !== null) {
        const match = key.match(clearValue('keyRegExp'))
        return clearChecked('keyRegExp') && match !== null && match.length > 0
      }
      if (value === null || value === undefined) {
        return clearChecked('null')
      } else if (isString(value)) {
        const string = clearChecked('string') && value.trim().length === 0
        const match = value.match(clearValue('valueRegExp'))
        const valueRegExp = clearChecked('valueRegExp') && match !== null && match.length > 0
        return string || valueRegExp
      } else if (isBoolean(value)) {
        return clearChecked('boolean') && !value
      } else if (isObject(value)) {
        return clearChecked('object') && Object.keys(value).length === 0
      } else if (isArray(value)) {
        return clearChecked('array') && value.length === 0
      }
      return false
    }
    this.formatValidate()
    if (!this.isError()) {
      this.setResultValue(JSON.stringify(deepClearJson(JSON.parse(this.getOriginJson()))))
      this.formatValidate(false)
    }
    return this.getResult()
  }

  /**
   * 转GET请求字符串
   */
  public toGetParams = (): JsonResult => {
    this.formatValidate(true)
    if (this.isError()) {
      this.setResultValue('', false)
      return this.getResult()
    }
    this.setResultValue(stringify(JSON.parse(this.getOriginJson())), false)
    return this.getResult()
  }
}

export const useJSONUtil = (json: Ref<JsonType>): JSONUtil => {
  return new JSONUtil(json);
}