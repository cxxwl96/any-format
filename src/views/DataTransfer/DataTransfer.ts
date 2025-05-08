import vkbeautify from 'vkbeautify'
import YAML from 'js-yaml'
import x2js from 'x2js'
import type { Language } from '@/components/monaco/data'
import { validateJson } from '@/utils/jsonUtil'

export type Type = 'JSON' | 'XML' | 'YAML'
export const DataTypeArray: { lang: Language; type: Type }[] = [
  { lang: 'json', type: 'JSON' },
  { lang: 'xml', type: 'XML' },
  { lang: 'yaml', type: 'YAML' }
] as const

export class DataTransfer {
  private value: string
  private type: Type
  private XML2JSON = new x2js({
    escapeMode: false,
    attributePrefix: '#',
    keepText: false
  })

  constructor(value: string, type: Type) {
    this.value = value
    this.type = type
  }

  /**
   * 通过type获取language
   *
   * @param type
   */
  public static getLang = (type: Type): Language | undefined => {
    return DataTypeArray.find(dataType => dataType.type === type)?.lang || undefined
  }

  /**
   * JSON转XML
   *
   * @param value
   * @param pretty
   */
  private json2xml = (value: string, pretty?: boolean): string => {
    const xml = this.XML2JSON.js2xml(JSON.parse(value)).replace(/&quot;/g, '"')
    return pretty ? vkbeautify.xml(xml) : xml
  }

  /**
   * JSON转YAML
   *
   * @param value
   * @param pretty
   */
  private json2yaml = (value: string, pretty?: boolean): string => {
    return YAML.dump(JSON.parse(value))
  }

  /**
   * XML转JSON
   *
   * @param value
   * @param pretty
   */
  private xml2json = (value: string, pretty?: boolean): string => {
    // xml校验
    if (window.DOMParser) {
      const domNode = new window.DOMParser().parseFromString(value, 'text/xml')
      // @ts-ignore
      const error = domNode?.querySelector('parsererror div')?.innerText
      if (error) {
        throw new Error(error)
      }
    }
    // 转换
    const json = this.XML2JSON.xml2js(value)
    // JSON校验
    validateJson(json, true)
    return pretty ? JSON.stringify(json, null, 4) : JSON.stringify(json)
  }

  /**
   * XML转YAML
   *
   * @param value
   * @param pretty
   */
  private xml2yaml = (value: string, pretty?: boolean): string => {
    return this.json2yaml(this.xml2json(value, pretty), pretty)
  }

  /**
   * YAML转JSON
   *
   * @param value
   * @param pretty
   */
  private yaml2json = (value: string, pretty?: boolean): string => {
    const json = YAML.load(value)
    // JSON校验
    validateJson(json, true)
    return pretty ? JSON.stringify(json, null, 4) : JSON.stringify(json)
  }

  /**
   * YAML转XML
   *
   * @param value
   * @param pretty
   */
  private yaml2xml = (value: string, pretty?: boolean): string => {
    return this.json2xml(this.yaml2json(value, pretty), pretty)
  }

  /**
   * 转JSON
   *
   * @param pretty
   */
  public toJSON = (pretty?: boolean): string => {
    switch (this.type) {
      case 'JSON':
        return pretty ? JSON.stringify(JSON.parse(this.value), null, 4) : JSON.stringify(this.value)
      case 'XML':
        return this.xml2json(this.value, pretty)
      case 'YAML':
        return this.yaml2json(this.value, pretty)
    }
    throw new Error('Unsupported type')
  }

  /**
   * 转XML
   *
   * @param pretty
   */
  public toXML = (pretty?: boolean): string => {
    switch (this.type) {
      case 'JSON':
        return this.json2xml(this.value, pretty)
      case 'XML':
        return pretty ? vkbeautify.xml(this.value) : this.value
      case 'YAML':
        return this.yaml2xml(this.value, pretty)
    }
    throw new Error('Unsupported type')
  }

  /**
   * 转YAML
   *
   * @param pretty
   */
  public toYAML = (pretty?: boolean): string => {
    switch (this.type) {
      case 'JSON':
        return this.json2yaml(this.value, pretty)
      case 'XML':
        return this.xml2yaml(this.value, pretty)
      case 'YAML':
        return this.json2yaml(this.yaml2json(this.value, pretty), pretty)
    }
    throw new Error('Unsupported type')
  }

  /**
   * 数据转换
   *
   * @param toType
   * @param pretty
   */
  public to = (toType: Type, pretty?: boolean) => {
    switch (toType) {
      case 'JSON':
        return this.toJSON(pretty)
      case 'XML':
        return this.toXML(pretty)
      case 'YAML':
        return this.toYAML(pretty)
    }
    throw new Error('Unsupported type')
  }
}

export const useDataTransfer = (value: string, type: Type): DataTransfer => {
  return new DataTransfer(value, type)
}