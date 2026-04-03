<template>
  <div class="space-y-6">
    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">可辨识联合（Discriminated Union）</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        每个类型有一个共同的<strong>字面量字段</strong>（如 type）作为辨识标签，TS 能根据这个标签自动推导出具体类型。
      </p>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">基本示例</h3>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto"><code>type Result =
  | { type: 'text'; content: string }
  | { type: 'image'; url: string; width: number }
  | { type: 'video'; url: string; duration: number }

function render(result: Result) {
  switch (result.type) {
    case 'text':
      // TS 推导：result 是 { type: 'text'; content: string }
      return result.content
    case 'image':
      // TS 推导：result 是 { type: 'image'; url: string; width: number }
      return `&lt;img src="${result.url}" width="${result.width}" /&gt;`
    case 'video':
      return `&lt;video src="${result.url}" /&gt;`
  }
}</code></pre>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">实际业务示例：SSE 消息处理</h3>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto"><code>type SSEMessage =
  | { event: 'thinking'; data: { step: string } }
  | { event: 'tool_call'; data: { name: string; args: unknown } }
  | { event: 'answer'; data: { content: string; done: boolean } }
  | { event: 'error'; data: { code: number; message: string } }

function handleSSE(msg: SSEMessage) {
  switch (msg.event) {
    case 'thinking':
      appendTimeline(msg.data.step)  // TS 知道有 step
      break
    case 'answer':
      appendContent(msg.data.content) // TS 知道有 content 和 done
      if (msg.data.done) finishStream()
      break
  }
}</code></pre>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">穷尽检查（Exhaustive Check）</h3>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto"><code>function assertNever(x: never): never {
  throw new Error(`Unexpected: ${x}`)
}

function handle(msg: SSEMessage) {
  switch (msg.event) {
    case 'thinking': /* ... */ break
    case 'tool_call': /* ... */ break
    case 'answer': /* ... */ break
    case 'error': /* ... */ break
    default:
      assertNever(msg) // 如果漏掉分支，编译期就报错
  }
}</code></pre>
    </section>
  </div>
</template>
