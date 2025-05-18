<template>
  <a-input v-model:value="currentIcon" allow-clear>
    <template #addonAfter>
      <a-popover v-model="visiable" placement="bottomLeft" trigger="click">
        <template #title>
          <div class="flex justify-between">
            <a-input v-model:value="searchIcon" @change="handleSearchChange" placeholder="搜索图标" allow-clear />
          </div>
        </template>
        <template #content>
          <a-spin :spinning="spinning">
            <div class="icon-picker-content">
              <ul v-if="iconList && iconList.length > 0" class="icon-picker-list" @scroll="(e) => e.preventDefault">
                <li v-for="icon in iconList" :key="icon" :title="icon" @click="handleSelectIcon(icon)"
                    :class="[icon===currentIcon && 'icon-picker-selected']">
                  <Icon :icon="icon" size="18" space="7" cursor-pointer />
                </li>
              </ul>
              <a-empty v-else />
            </div>
          </a-spin>
        </template>
        <Icon :icon="currentIcon || 'ion:apps-outline'" cursor-pointer />
      </a-popover>
    </template>
  </a-input>
</template>
<script setup lang="ts">
import axios from 'axios'
import { computed, ref, unref, watch } from 'vue'
import { notification } from 'ant-design-vue'
import { useDebounceFn } from '@vueuse/shared'
import IconData from '../data/icons.data'
import Icon from './Icon.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  anySearch: { type: Boolean, default: false },
})
const emits = defineEmits(['update:modelValue'])

const getIconData = computed(() => IconData.icons.map(icon => `${IconData.prefix}:${icon}`))
const visiable = ref<boolean>(false)
const spinning = ref<boolean>(false)
const currentIcon = ref<string>(props.modelValue)
const searchIcon = ref<string>('')
const iconList = ref<string[]>(unref(getIconData.value))

/**
 * 搜索
 */
const handleSearchChange = useDebounceFn(() => {
  spinning.value = true
  if (!searchIcon.value) {
    iconList.value = unref(getIconData.value)
    spinning.value = false
    return
  }
  iconList.value = []
  // 优先使用本地icon
  const icons = unref(getIconData.value.filter(icon => icon.includes(searchIcon.value)))
  if (icons && icons.length > 0) {
    iconList.value.push(...icons)
    spinning.value = false
    // 不再搜索
    if (!props.anySearch) {
      return
    }
  }
  // 搜索iconify
  axios({
    method: 'GET',
    url: '//api.iconify.design/search',
    params: {
      query: searchIcon.value,
      limit: 999
    }
  }).then(res => {
    iconList.value.push(...(res.data?.icons || []))
    // 去重
    iconList.value = Array.from(new Set(iconList.value))
  }).catch(err => {
    notification.error({
      message: '请求发生异常',
      description: err.message,
      placement: 'topRight'
    })
  }).finally(() => {
    spinning.value = false
  })
}, 100)

/**
 * 选择icon
 *
 * @param icon
 */
const handleSelectIcon = (icon: string) => {
  currentIcon.value = icon
  emits('update:modelValue', icon)
}
</script>
<style scoped>
.icon-picker-content {
  width: 320px;
  height: 320px;
  overflow: hidden;
  overflow-y: auto;
  display: inline-flex;
  justify-content: center;
  align-items: center;

  .icon-picker-list {
    all: unset;
    width: 100%;
    height: 100%;

    li {
      display: inline-flex;
      margin: 4px 4px 0 0;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    li:hover {
      border: 1px solid #4096ff;
      color: #4096ff;
    }

    li.icon-picker-selected {
      border: 1px solid #4096ff;
      color: #4096ff;
    }
  }
}
</style>