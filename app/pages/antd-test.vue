<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-6">Ant Design Vue 按需引入测试</h1>

    <div class="space-x-4">
      <AButton type="primary">Primary 按钮</AButton>
      <AButton>Default 按钮</AButton>
      <AButton type="dashed">Dashed 按钮</AButton>
      <AButton danger>Danger 按钮</AButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button as AButton } from 'ant-design-vue'
</script>
