
<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">
      2️⃣ fetch-event-source（生产级实战）
      <span class="text-base font-normal text-gray-500">@microsoft/fetch-event-source</span>
    </h1>

    <div class="border-2 border-green-200 rounded-lg p-5 bg-green-50 space-y-3">
      <div class="text-xs text-gray-700 space-y-1">
        <p>✅ POST 请求 + body 传完整消息历史</p>
        <p>✅ 自定义 header（Authorization + 多租户 shell-name）</p>
        <p>✅ AbortController 主动中断（停止生成）</p>
        <p>✅ 可读响应头（trace-id 上报）</p>
        <p>✅ openWhenHidden:true（切后台不断流）</p>
        <p>✅ item_id 分片合并（思考/工具/答案各自落位不串包）</p>
        <p>✅ onerror 抛异常阻止默认自动重连</p>
      </div>

      <div>
        <label class="block mb-1 text-sm font-medium">输入消息</label>
        <input v-model="userInput" class="w-full px-3 py-2 border rounded" />
      </div>

      <div class="flex gap-2 items-center">
        <button
          class="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          :disabled="status === 'streaming'"
          @click="start"
        >
          开始
        </button>
        <button class="px-4 py-2 bg-gray-300 rounded" @click="stop">
          停止生成
        </button>
        <span class="text-sm text-gray-600">状态: {{ status }}</span>
      </div>

      <!-- 响应头（trace-id） -->
      <div v-if="traceId" class="text-xs text-gray-500">
        响应头 X-Trace-Id: <code class="bg-white px-2 py-0.5 rounded">{{ traceId }}</code>
      </div>

      <!-- 双层结构：外层 message，内层 replyMessage[] 装多个 step -->
      <div
        ref="messageContainer"
        class="bg-white p-3 rounded border min-h-[200px] max-h-[400px] overflow-auto text-sm space-y-3"
        @scroll="handleScroll"
      >
        <div v-if="!replyMessage.length" class="text-gray-400">
          （Agent 多步推理时间线会显示在这里）
        </div>

        <!-- 按 item_id 分片渲染：思考 / 工具 / 答案 各自独立卡片 -->
        <div
          v-for="step in replyMessage"
          :key="step.item_id"
          class="border-l-2 pl-3"
          :class="stepBorderColor(step.type)"
        >
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs px-2 py-0.5 rounded" :class="stepTagColor(step.type)">
              {{ stepLabel(step.type) }}
            </span>
            <span class="text-xs text-gray-400">item_id: {{ step.item_id }}</span>
          </div>
          <div class="whitespace-pre-wrap">
            <!-- 思考块：流式 delta，完成后用 content 覆盖 -->
            <span v-if="step.kind === 'think'" class="text-gray-600 italic">
              {{ step.content || step.delta }}
            </span>
            <!-- 工具块：started 显示 params，completed 显示 result -->
            <span v-else-if="step.kind === 'tool'" class="text-blue-700">
              <div v-if="step.params">📤 调用参数: {{ JSON.stringify(step.params) }}</div>
              <div v-if="step.result">📥 调用结果: {{ step.result }}</div>
              <div v-if="!step.result" class="text-gray-400">⏳ 工具调用中...</div>
            </span>
            <!-- 答案块：流式 delta -->
            <span v-else>
              {{ step.content || step.delta }}
            </span>
          </div>
        </div>
      </div>

      <p class="text-xs text-gray-500">
        💡 点开始后 DevTools Network → 找 sse-stream → Headers 能看到 Authorization；
        Console 也会打印 trace-id。试试切到其他 tab 再切回来 → 因为 openWhenHidden:true，流不会断。
      </p>
    </div>
  </div>
</template>


<script setup lang="ts">
/**
 * 2️⃣ fetch-event-source 生产级实战
 *
 * 7 个生产亮点：
 *  1. POST + 自定义 header（Authorization、shell-name 多租户）
 *  2. AbortController 主动中断
 *  3. 可读响应头（trace-id 上报）
 *  4. openWhenHidden:true 切后台不断流
 *  5. item_id 分片合并：同一答案被拆成思考/工具/答案多块，按 id 落位不串
 *  6. type 状态机分发：think_delta/tool_call_started/text_delta 等映射到不同 UI
 *  7. onerror 主动 throw 阻止库的默认自动重连
 *
 * 访问：/interview/sse-fetch
 */

import { ref, onUnmounted, nextTick } from 'vue'
import { fetchEventSource } from '@microsoft/fetch-event-source'

// ─── 事件类型枚举（对齐生产端协议） ───
enum AgentEventType {
  conversation_started = 'conversation_started',
  conversation_completed = 'conversation_completed',
  conversation_error = 'conversation_error',
  think_delta = 'think_delta',
  think_done = 'think_done',
  tool_call_started = 'tool_call_started',
  tool_call_completed = 'tool_call_completed',
  text_delta = 'text_delta',
  text_done = 'text_done',
}

interface ReplyStep {
  item_id: string
  type: string
  kind: 'think' | 'tool' | 'answer'
  delta?: string
  content?: string
  params?: any
  result?: any
}

const userInput = ref('帮我写一首关于春天的诗')
const status = ref<'idle' | 'streaming' | 'done' | 'error'>('idle')
const traceId = ref('')
const conversationId = ref('')

// 双层结构：外层一条 message，内层 replyMessage[] 按 item_id 装多个 step
const replyMessage = ref<ReplyStep[]>([])

// 滚动控制
const messageContainer = ref<HTMLElement | null>(null)
let userScrolledUp = false

// AbortController：可在任意时刻 abort 掉 fetch
let ctrl: AbortController | null = null

async function start() {
  replyMessage.value = []
  traceId.value = ''
  conversationId.value = ''
  status.value = 'streaming'
  userScrolledUp = false

  ctrl = new AbortController()

  await fetchEventSource('/api/sse-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer fake_jwt_token_in_header',
      'shell-name': 'team-demo',  // 生产里的多租户头
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: userInput.value }],
    }),
    signal: ctrl.signal,
    // ✅ 亮点 1：切到后台 tab 也保持连接，否则默认会自动断开重连
    openWhenHidden: true,

    // ✅ 亮点 2：onopen 校验状态码 + 读响应头
    async onopen(response) {
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status} ${response.statusText}`)
      }
      // 读响应头(trace-id 上报)
      traceId.value = response.headers.get('x-trace-id') || ''
      console.log('🚀 SSE 连接建立, trace-id:', traceId.value)
    },

    // ✅ 亮点 3：item_id 分片合并 + type 状态机分发
    onmessage(ev) {
      if (!ev.data) return
      let data: any
      try {
        data = JSON.parse(ev.data)
      } catch {
        return
      }

      // 找到/创建分片：同一 item_id 的多个 chunk 合并到一个 step
      let step: ReplyStep | undefined
      if (data.item_id) {
        step = replyMessage.value.find(s => s.item_id === data.item_id)
        if (!step) {
          step = {
            item_id: data.item_id,
            type: data.type,
            kind: kindOf(data.type),
            delta: '',
          }
          replyMessage.value.push(step)
        } else {
          step.type = data.type
        }
      }

      // type 状态机分发
      switch (data.type) {
        case AgentEventType.conversation_started:
          conversationId.value = data.conversationId
          break

        case AgentEventType.think_delta:
        case AgentEventType.text_delta:
          if (step) step.delta = (step.delta || '') + data.delta
          break

        case AgentEventType.think_done:
        case AgentEventType.text_done:
          if (step) step.content = data.content
          break

        case AgentEventType.tool_call_started:
          if (step) step.params = data.params
          break

        case AgentEventType.tool_call_completed:
          if (step) step.result = data.result
          break

        case AgentEventType.conversation_completed:
          status.value = 'done'
          break

        case AgentEventType.conversation_error:
          status.value = 'error'
          throw new Error(data.content || '回答失败')
      }

      // 智能滚动：用户主动上滑就不抢屏
      if (!userScrolledUp) {
        nextTick(() => scrollToBottom())
      }
    },

    // ✅ 亮点 4：onerror 主动 throw 阻止库的默认无限重连
    onerror(err) {
      console.error('SSE 错误:', err)
      status.value = 'error'
      ctrl?.abort()
      throw err  // 不 throw 的话库会自动重连，烧 token
    },

    onclose() {
      if (status.value === 'streaming') status.value = 'done'
      console.log('✅ SSE 连接关闭')
    },
  }).catch((err) => {
    if (err?.name === 'AbortError') {
      console.log('用户主动停止生成')
      status.value = 'idle'
    }
  })
}

function stop() {
  ctrl?.abort()
}

// ─── 工具函数 ───
function kindOf(type: string): 'think' | 'tool' | 'answer' {
  if (type.startsWith('think')) return 'think'
  if (type.startsWith('tool')) return 'tool'
  return 'answer'
}

function stepLabel(type: string) {
  if (type.startsWith('think')) return '🧠 思考'
  if (type.startsWith('tool')) return '🔧 工具'
  return '💬 回答'
}

function stepBorderColor(type: string) {
  if (type.startsWith('think')) return 'border-gray-400'
  if (type.startsWith('tool')) return 'border-blue-400'
  return 'border-green-500'
}

function stepTagColor(type: string) {
  if (type.startsWith('think')) return 'bg-gray-200 text-gray-700'
  if (type.startsWith('tool')) return 'bg-blue-100 text-blue-700'
  return 'bg-green-100 text-green-700'
}

function isAtBottom() {
  const el = messageContainer.value
  if (!el) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight < 20
}

function scrollToBottom() {
  const el = messageContainer.value
  if (el) el.scrollTop = el.scrollHeight
}

function handleScroll() {
  // 用户向上滚 → 标记，不再自动滚屏；滚到底部 → 恢复自动滚
  userScrolledUp = !isAtBottom()
}

onUnmounted(() => {
  ctrl?.abort()
})
</script>
