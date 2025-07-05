import { message, notification } from 'ant-design-vue'
import vkbeautify from 'vkbeautify'
import { type Ref, unref } from 'vue'


class XMLUtil {
  /**
   * 原始XML
   */
  private originXml: Ref<string>

  constructor(xml: Ref<string>) {
    this.originXml = xml
  }

  private getOriginXml = () => {
    return this.originXml.value
  }

  private setOriginXml = (xml: string) => {
    this.originXml.value = xml
    return xml
  }

  /**
   * 格式化
   */
  public format = (): string => {
    if (!this.getOriginXml()) {
      message.info('请输入内容')
      return this.setOriginXml('')
    }
    return this.setOriginXml(vkbeautify.xml(unref(this.getOriginXml())))
  }

  /**
   * 压缩
   */
  public compress = (): string => {
    if (!this.getOriginXml()) {
      message.info('请输入内容')
      return this.setOriginXml('')
    }
    return this.setOriginXml(vkbeautify.xmlmin(unref(this.getOriginXml())))
  }

  /**
   * 节点排序
   */
  public sort = (asc: boolean = true): string => {
    if (!this.getOriginXml()) {
      message.info('请输入内容')
      return this.setOriginXml('')
    }
    // 判断并获取xml头
    const matchs = this.getOriginXml().matchAll(new RegExp('<\\?xml.*\\?>', 'gi'))
    let xmlHeader = ''
    for (const match of matchs) {
      xmlHeader = match[0]
    }

    // 解析XML字符串
    const xmlDoc = new DOMParser().parseFromString(unref(this.getOriginXml()), 'text/xml')

    // 是否解析错误
    const parsererror = xmlDoc.getElementsByTagName('parsererror')
    if (parsererror.length > 0) {
      notification.error({
        message: 'XML格式错误',
        // @ts-ignore
        description: parsererror.item(0)?.innerText,
        placement: 'topRight'
      })
      return this.getOriginXml()
    }

    const deepSort = (elements: Element[], asc: boolean): Element[] => {
      // 节点排序
      const sortedElements = elements.sort((a, b) => a.tagName.localeCompare(b.tagName))
      if (!asc) {
        sortedElements.reverse()
      }
      for (const element of sortedElements) {
        // 节点属性排序
        const attrNames = asc ? element.getAttributeNames().sort() : element.getAttributeNames().sort().reverse()
        const attrMap = new Map()
        for (const name of attrNames) {
          attrMap.set(name, element.getAttribute(name))
          element.removeAttribute(name)
        }
        for (const name of attrNames) {
          element.setAttribute(name, attrMap.get(name))
        }

        // 子节点递归排序
        const children = deepSort(Array.from(element.children), asc)
        // 子节点排序后重新赋值
        element.remove()
        for (const child of children) {
          element.appendChild(child)
        }
      }
      return sortedElements
    }
    this.setOriginXml(xmlHeader + deepSort(Array.from(xmlDoc.children), asc).map(item => item.outerHTML).join('\r'))
    return this.format()
  }

}

export const useXMLUtil = (xml: Ref<string>): XMLUtil => {
  return new XMLUtil(xml)
}