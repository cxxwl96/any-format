<script setup lang="ts">
defineProps({
  top: {type: Number, required: false, default: 20}
})
</script>

<template>
  <div :style="{ paddingTop: top + 'px' }">
    <a-affix :offset-bottom="50">
      <a-space :size="[8, 16]" wrap class="bottom-button-group">
        <slot name="default"/>
      </a-space>
    </a-affix>
  </div>
</template>

<style scoped>
.bottom-button-group {
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(2px);
}

:global(.ant-dropdown .ant-dropdown-menu) {
  padding: 0 !important;
  border-radius: 3px !important;
}

:global(.ant-dropdown .ant-dropdown-menu .ant-dropdown-menu-item) {
  padding: 0 10px !important;
}
</style>