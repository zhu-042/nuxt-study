/**
 * 模拟 AI 流式回答的 SSE 接口
 * 同时支持 GET（原生 EventSource）和 POST（fetch-event-source）
 *
 * SSE 协议格式：
 *   data: {...}\n\n
 *   data: {...}\n\n
 *   每个事件以 \n\n 结尾
 */

export default defineEventHandler(async (event) => {
  // 设置 SSE 标准响应头
  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')
  // 自定义响应头（演示 fetch-event-source 能读到，原生 EventSource 读不到）
  setHeader(event, 'X-Trace-Id', `trace-${Date.now()}`)

  // 兼容 GET 和 POST
  let userQuery = ''
  if (event.method === 'GET') {
    const query = getQuery(event)
    userQuery = String(query.q || '默认问题')
  } else {
    const body = await readBody(event)
    userQuery = body?.messages?.[body.messages.length - 1]?.content || '默认问题'
  }

  // 用 ReadableStream 推流
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        // SSE 协议：data: <json>\n\n
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // 模拟 Agent 多步推理过程
      // 关键：每个步骤(思考/工具/答案)有自己的 item_id，前端按 id 合并分片
      const conversationId = `conv_${Date.now()}`
      const messageId = `msg_${Date.now()}`

      // 会话开始
      send({ conversationId, messageId, type: 'conversation_started' })

      // 步骤 1：思考过程(流式)
      await sleep(200)
      const thinkItemId = 'think_1'
      const thinkText = `分析用户问题："${userQuery}"，需要先检索相关资料...`
      for (const char of thinkText) {
        await sleep(20)
        send({ conversationId, messageId, item_id: thinkItemId, type: 'think_delta', delta: char })
      }
      send({ conversationId, messageId, item_id: thinkItemId, type: 'think_done', content: thinkText })

      // 步骤 2：工具调用(开始 + 完成)
      await sleep(300)
      const toolItemId = 'tool_1'
      send({ conversationId, messageId, item_id: toolItemId, type: 'tool_call_started', params: { query: userQuery } })
      await sleep(500)
      send({ conversationId, messageId, item_id: toolItemId, type: 'tool_call_completed', result: '找到 3 篇相关资料' })

      // 步骤 3：最终回答(流式)
      await sleep(300)
      const answerItemId = 'answer_1'
      const answer = '春风又绿江南岸，明月何时照我还。\n这首诗描绘了春天江南的生机盎然，寄托了诗人的思乡之情。'
      for (const char of answer) {
        await sleep(40)
        send({ conversationId, messageId, item_id: answerItemId, type: 'text_delta', delta: char })
      }
      send({ conversationId, messageId, item_id: answerItemId, type: 'text_done', content: answer })

      // 兼容老的 sse-native.vue：它只识别 type='answer'/'done'
      // 用一条 'answer' 兜底事件让原生 demo 也能显示完整答案
      send({ messageId, type: 'answer', delta: answer })

      // 会话完成
      send({ conversationId, messageId, type: 'conversation_completed' })
      send({ messageId, type: 'done' })
      controller.close()
    },
  })

  return sendStream(event, stream)
})

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Nitro 的 sendStream helper（直接把 ReadableStream 作为响应体返回也可以）
function sendStream(event: any, stream: ReadableStream) {
  return stream
}
