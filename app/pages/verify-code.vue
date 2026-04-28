<template>
  <button :disabled="open" @click="start">
    {{ open ? `${count}秒后重试` : '发送验证码' }}
  </button>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const TOTAL = 60
const count = ref(TOTAL)
const open = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const start = () => {
  if (open.value) return
  open.value = true
  count.value = TOTAL
  timer = setInterval(() => {
    count.value--
    if (count.value <= 0) {
      clearInterval(timer!)
      timer = null
      open.value = false
      count.value = TOTAL
    }
  }, 1000)
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
