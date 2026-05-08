

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">1️⃣ 原生 EventSource（SSE）</h1>

    <div class="border-2 border-red-200 rounded-lg p-5 bg-red-50 space-y-3">
      <div class="text-xs text-gray-700 space-y-1">
        <p>❌ 只能 GET，body 塞不下完整消息历史</p>
        <p>❌ 不能自定义 header，token 只能塞 URL</p>
        <p>❌ 不能 abort（关闭后不能精细控制"停止生成"）</p>
        <p>❌ 不能读响应头（trace-id 拿不到）</p>
        <p>✅ 自带断线自动重连</p>
      </div>

      <div>
        <label class="block mb-1 text-sm font-medium">输入消息</label>
        <input v-model="userInput" class="w-full px-3 py-2 border rounded" />
      </div>

      <div class="flex gap-2 items-center">
        <button
          class="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
          :disabled="status === 'streaming'"
          @click="start"
        >
          开始
        </button>
        <button class="px-4 py-2 bg-gray-300 rounded" @click="stop">
          关闭连接
        </button>
        <span class="text-sm text-gray-600">状态: {{ status }}</span>
      </div>

      <div class="bg-white p-3 rounded border min-h-[100px] whitespace-pre-wrap text-sm">
        {{ messages || '（流式输出会显示在这里）' }}
      </div>

      <p class="text-xs text-gray-500">
        💡 打开 DevTools Network → 找 sse-stream 请求 → 看 Headers，会发现没有 Authorization 头，token 暴露在 URL 里。
      </p>
    </div>
  </div>
</template>


<script setup lang="ts">
/**
 * 1️⃣ 原生 EventSource（SSE）
 *
 * ❌ 限制 1：只能 GET，参数只能塞 URL
 * ❌ 限制 2：不能自定义 header，token 只能放 URL（不安全）
 * ❌ 限制 3：不能 abort（用户"停止生成"做不细）
 * ❌ 限制 4：不能读响应头
 * ✅ 优点：浏览器原生支持自动断线重连
 *
 * 访问：/interview/sse-native
 */

import { ref, onUnmounted } from 'vue'

const userInput = ref('帮我写一首关于春天的诗')
const messages = ref('')
const status = ref<'idle' | 'streaming' | 'done' | 'error'>('idle')
let es: EventSource | null = null

function start() {
  // 参数只能塞 URL，token 只能裸暴露
  const url = `/api/sse-stream?q=${encodeURIComponent(userInput.value)}&token=fake_token_in_url`

  messages.value = ''
  status.value = 'streaming'

  es = new EventSource(url)

  es.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'done') {
      status.value = 'done'
      es?.close()
      return
    }
    // 只取最终回答的增量
    if (data.type === 'answer') {
      messages.value += data.delta
    }
  }

  es.onerror = () => {
    status.value = 'error'
    es?.close()
  }
}

function stop() {
  es?.close()
  status.value = 'idle'
}

onUnmounted(() => {
  es?.close()
})
</script>
