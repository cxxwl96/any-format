<script setup lang="ts">
import { CodeMirror, MODE } from '@/components/CodeEditor'
import { ref, unref } from 'vue'
import vkbeautify from 'vkbeautify'
import { notification } from 'ant-design-vue'
import { getTextFromClipboard } from '@/utils/useCopyToClipboard'
import { useSessionCache } from '@/utils/CacheData'

const sessionCache = useSessionCache('XmlFormat')
const data = ref<string>(sessionCache.load())

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
</script>

<template>
  <div>
    <div class="tip-font">
      Tip：<a @click="async () => {data = await getTextFromClipboard()}">粘贴文本</a>，双击格式化
    </div>
    <CodeMirror ref="el" v-model="data" @change="sessionCache.cache" @dblclick="handleFormat" :mode="MODE.XML"
                :theme="'eclipse'" />
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
      </a-space>
    </a-affix>
  </div>
</template>

<style scoped>
</style>