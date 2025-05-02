<script setup lang="ts">
import { CodeMirror, MODE } from '@/components/CodeEditor'
import { ref, unref } from 'vue'
import vkbeautify from 'vkbeautify'
import { notification } from 'ant-design-vue'
import { getTextFromClipboard } from '@/utils/useCopyToClipboard'
import { useSessionCache } from '@/utils/CacheData'
import { XML2JSON } from '@/data'
import { validateJson } from '@/utils/jsonUtil'
import { MonacoEditor } from '@/components/monaco'

const sessionCache = useSessionCache('XmlFormat')
const data = ref<string>(sessionCache.load())
const jsonValue = ref<string>('')
const openModal = ref<boolean>(false)

// 格式化
function handleFormat() {
  data.value = vkbeautify.xml(unref(data.value))
}

// 压缩
function handleCompress() {
  data.value = vkbeautify.xmlmin(unref(data.value))
}

// 节点排序
function handleSort(asc: boolean = true) {
  if (!data.value) {
    return
  }
  // 判断并获取xml头
  const matchs = data.value.matchAll(new RegExp('<\\?xml.*\\?>', 'gi'))
  let xmlHeader = ''
  for (let match of matchs) {
    xmlHeader = match[0]
  }

  // 解析XML字符串
  const xmlDoc = new DOMParser().parseFromString(unref(data.value), 'text/xml')

  // 是否解析错误
  const parsererror = xmlDoc.getElementsByTagName('parsererror')
  if (parsererror.length > 0) {
    notification.error({
      message: 'XML格式错误',
      // @ts-ignore
      description: parsererror.item(0)?.innerText,
      placement: 'topRight'
    })
    return
  }

  const deepSort = (elements: Element[], asc: boolean): Element[] => {
    // 节点排序
    const sortedElements = elements.sort((a, b) => a.tagName.localeCompare(b.tagName))
    if (!asc) {
      sortedElements.reverse()
    }
    for (let element of sortedElements) {
      // 节点属性排序
      const attrNames = asc ? element.getAttributeNames().sort() : element.getAttributeNames().sort().reverse()
      const attrMap = new Map()
      for (let name of attrNames) {
        attrMap.set(name, element.getAttribute(name))
        element.removeAttribute(name)
      }
      for (let name of attrNames) {
        element.setAttribute(name, attrMap.get(name))
      }

      // 子节点递归排序
      const children = deepSort(Array.from(element.children), asc)
      // 子节点排序后重新赋值
      element.remove()
      for (let child of children) {
        element.appendChild(child)
      }
    }
    return sortedElements
  }
  data.value = xmlHeader + deepSort(Array.from(xmlDoc.children), asc).map(item => item.outerHTML).join('\r')
  handleFormat()
}

// XML转JSON
const handleXml2Json = () => {
  const value = unref(data.value)
  if (value) {
    try {
      const json = JSON.stringify(XML2JSON.xml2js(value))
      const result = validateJson(json)
      if (result.error) {
        throw new Error(result.message)
      }
      notification['success']({
        message: '转换成功',
        placement: 'topRight'
      })
      jsonValue.value = result.value
      openModal.value = true
    } catch (e: any) {
      notification['error']({
        message: '转换失败',
        description: e?.message,
        placement: 'topRight'
      })
    }
  }
}
</script>

<template>
  <MonacoEditor language="xml" v-model="data" @change="sessionCache.cache" @dblClick="handleFormat" style="height: calc(100vh - 200px)">
    <template #title>
      <div class="tip-font">
        Tip：<a @click="async () => {data = await getTextFromClipboard()}">粘贴文本</a>，双击格式化
      </div>
    </template>
  </MonacoEditor>
  <a-divider />
  <a-affix :offset-bottom="50">
    <a-space :size="[8, 16]" wrap class="bottom-button-group">
      <a-button type="primary" @click="handleFormat">格式化</a-button>
      <a-button @click="handleCompress">压缩</a-button>
      <a-dropdown-button @click="handleSort">
        节点升序
        <template #overlay>
          <a-button @click="handleSort(false)">节点降序</a-button>
        </template>
      </a-dropdown-button>
      <a-divider type="vertical"/>
      <a-button type="primary" @click="handleXml2Json">XML转JSON</a-button>
    </a-space>
  </a-affix>
  <a-modal v-model:open="openModal" @ok="openModal=false" width="80%" centered>
    <MonacoEditor v-model="jsonValue" language="json" style="height: 70vh"/>
  </a-modal>
</template>

<style scoped></style>