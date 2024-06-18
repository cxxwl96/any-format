<script setup lang="ts">
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'

const props = defineProps({
  data: { type: Object || String }
})
</script>
<template>
  <VueJsonPretty v-bind="$attrs" :data="props.data" :showLenght="true" />
</template>

<style scoped>

</style>