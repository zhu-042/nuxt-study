<template>
  <div class="space-y-2">
    <label class="block">
      <input type="checkbox" v-model="checkAll"> 全选
    </label>
    <label v-for="item in fruits" :key="item" class="block">
      <input type="checkbox" :value="item" v-model="list"> {{ item }}
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const fruits = ref(['葡萄', '苹果', '香蕉'])
const list = ref<string[]>([])

const checkAll = computed({
  get: () => fruits.value.length > 0 && list.value.length === fruits.value.length,
  set: (val) => {
    list.value = val ? [...fruits.value] : []
  },
})
</script>
