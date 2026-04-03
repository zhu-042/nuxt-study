<template>
  <div class="space-y-6">
    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">为什么异步控制要求更高</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        这些场景涉及<strong>长时间、分片、可中断</strong>的异步操作，需要精细控制并发、进度、重试和取消。
      </p>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">大文件上传</h3>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto"><code>// 分片上传 + 并发控制
async function uploadLargeFile(file: File) {
  const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB
  const chunks = Math.ceil(file.size / CHUNK_SIZE)
  const MAX_CONCURRENT = 3

  // 1. SHA256 秒传检查
  const hash = await calculateSHA256(file)
  const exists = await checkFileExists(hash)
  if (exists) return exists.url

  // 2. 并发控制上传
  const pool: Promise&lt;void&gt;[] = []
  for (let i = 0; i &lt; chunks; i++) {
    const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
    const task = uploadChunk(chunk, i, hash)

    pool.push(task)
    if (pool.length &gt;= MAX_CONCURRENT) {
      await Promise.race(pool) // 等最快完成的一个
      pool.splice(pool.findIndex(p =&gt; /* done */), 1)
    }
  }
  await Promise.all(pool)

  // 3. 合并请求
  return await mergeChunks(hash, chunks)
}</code></pre>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">SSE 流式对话</h3>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto"><code>// 需要处理：连接断开、重连、手动中止
const controller = new AbortController()

fetchEventSource('/api/chat', {
  signal: controller.signal,
  onmessage(event) {
    const data = JSON.parse(event.data)
    appendMessage(data.content) // 增量追加
    autoScroll()                // 智能滚动
  },
  onerror(err) {
    if (retryCount &lt; 3) retry()
    else showError()
  },
})

// 用户点击停止
function stopGeneration() {
  controller.abort()
}</code></pre>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">实时语音识别</h3>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto"><code>// 涉及多个异步资源的生命周期管理
let audioContext: AudioContext
let mediaStream: MediaStream
let ws: WebSocket

async function startRecognition() {
  // 1. 获取麦克风权限
  mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })

  // 2. 创建音频处理管线
  audioContext = new AudioContext({ sampleRate: 16000 })
  const source = audioContext.createMediaStreamSource(mediaStream)
  const processor = audioContext.createScriptProcessor(4096)

  // 3. WebSocket 流式发送
  ws = new WebSocket('wss://asr-service')
  processor.onaudioprocess = (e) =&gt; {
    const pcmData = e.inputBuffer.getChannelData(0)
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(encodePCM(pcmData))
    }
  }

  source.connect(processor)
  processor.connect(audioContext.destination)
}

// 必须精确释放所有资源
function stopRecognition() {
  ws?.close()
  mediaStream?.getTracks().forEach(t =&gt; t.stop())
  audioContext?.close()
}</code></pre>
    </section>

    <div class="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 text-sm text-indigo-700">
      <strong>核心挑战：</strong>并发控制（限制同时进行的异步操作数量）、取消机制（AbortController）、资源释放（防止内存泄漏）、错误恢复（重试 + 降级）。
    </div>
  </div>
</template>
