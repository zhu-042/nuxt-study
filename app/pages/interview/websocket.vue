
<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">3️⃣ WebSocket</h1>

    <div class="border-2 border-blue-200 rounded-lg p-5 bg-blue-50 space-y-3">
      <div class="text-xs text-gray-700 space-y-1">
        <p>✅ 双向通信（客户端可以多次发）</p>
        <p>✅ 支持二进制数据</p>
        <p>❌ 独立协议（ws://），需要 HTTP Upgrade 握手</p>
        <p>❌ 没有自动重连，要自己写心跳和重连</p>
        <p>❌ AI 一问一答用不到双向，反而要维护连接状态</p>
      </div>

      <div>
        <label class="block mb-1 text-sm font-medium">输入消息（连接后可反复发送）</label>
        <input v-model="userInput" class="w-full px-3 py-2 border rounded" />
      </div>

      <div class="flex gap-2 items-center flex-wrap">
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          :disabled="status === 'open' || status === 'connecting'"
          @click="connect"
        >
          建立连接
        </button>
        <button
          class="px-4 py-2 bg-blue-400 text-white rounded disabled:opacity-50"
          :disabled="status !== 'open'"
          @click="send"
        >
          发消息
        </button>
        <button class="px-4 py-2 bg-gray-300 rounded" @click="disconnect">
          关闭连接
        </button>
        <span class="text-sm text-gray-600">状态: {{ status }}</span>
      </div>

      <div class="bg-white p-3 rounded border min-h-[150px] max-h-80 overflow-auto text-sm space-y-2">
        <div v-if="!messages.length" class="text-gray-400">（消息会显示在这里）</div>
        <div v-for="(msg, i) in messages" :key="i" class="flex items-start gap-2">
          <span :class="tagColor(msg.from)" class="px-2 py-0.5 rounded text-xs shrink-0">
            {{ msg.from }}
          </span>
          <span class="text-gray-400 text-xs shrink-0">{{ msg.time }}</span>
          <span class="break-all">{{ msg.content }}</span>
        </div>
      </div>

      <p class="text-xs text-gray-500">
        💡 体验双向能力：连接后多次点「发消息」，每次都能发，服务端也会原样推回来。
        AI 对话场景下这个双向能力是冗余的，只需 SSE 单向推送即可。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 3️⃣ WebSocket
 *
 * ✅ 双向通信（客户端可以多次发消息）
 * ✅ 支持二进制
 * ❌ 独立协议（ws://、wss://），需要 HTTP Upgrade 握手
 * ❌ 没有自动重连，要自己写心跳和重连
 * ❌ AI 一问一答场景双向能力用不到，反而要维护连接状态
 *
 * 演示用公共 echo 服务器（你发什么它原样返回）
 * 访问：/interview/websocket
 */

import { ref, onUnmounted } from 'vue'

const userInput = ref('hello WebSocket')
const messages = ref<Array<{ from: string; content: string; time: string }>>([])
const status = ref<'idle' | 'connecting' | 'open' | 'closed' | 'error'>('idle')
let ws: WebSocket | null = null

function connect() {
  // 公共 echo 服务器（原样返回你发的消息）
  ws = new WebSocket('wss://echo.websocket.events')
  status.value = 'connecting'
  messages.value = []

  ws.onopen = () => {
    status.value = 'open'
    messages.value.push({
      from: 'system',
      content: '连接已建立',
      time: new Date().toLocaleTimeString(),
    })
  }

  // ✅ 双向：服务端推送消息时触发
  ws.onmessage = (event) => {
    messages.value.push({
      from: 'server',
      content: String(event.data),
      time: new Date().toLocaleTimeString(),
    })
  }

  ws.onerror = () => {
    status.value = 'error'
    messages.value.push({
      from: 'system',
      content: '连接出错',
      time: new Date().toLocaleTimeString(),
    })
  }

  ws.onclose = () => {
    status.value = 'closed'
    messages.value.push({
      from: 'system',
      content: '连接已关闭（WebSocket 不会自动重连，需要自己写重连逻辑）',
      time: new Date().toLocaleTimeString(),
    })
  }
}

// ✅ 双向：客户端可以主动发消息（且可以反复发）
function send() {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(userInput.value)
    messages.value.push({
      from: 'client',
      content: userInput.value,
      time: new Date().toLocaleTimeString(),
    })
  } else {
    alert('请先建立连接')
  }
}

function disconnect() {
  ws?.close()
}

onUnmounted(() => {
  ws?.close()
})

function tagColor(from: string) {
  if (from === 'client') return 'bg-blue-100 text-blue-700'
  if (from === 'server') return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-600'
}
</script>

