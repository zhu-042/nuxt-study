<template>
  <div class="space-y-6">
    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">核心区别</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h4 class="font-semibold text-blue-700 mb-2">防抖 Debounce</h4>
          <p class="text-sm text-gray-600">事件停止触发后延迟执行，连续触发会<strong>重置计时器</strong>。</p>
          <p class="text-xs text-gray-400 mt-2">比喻：电梯关门 — 有人进来就重新等。</p>
        </div>
        <div class="bg-green-50 border border-green-100 rounded-lg p-4">
          <h4 class="font-semibold text-green-700 mb-2">节流 Throttle</h4>
          <p class="text-sm text-gray-600">固定时间间隔内只执行一次，<strong>不会重置</strong>。</p>
          <p class="text-xs text-gray-400 mt-2">比喻：地铁发车 — 到点就走，不等人。</p>
        </div>
      </div>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">手写实现</h3>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto"><code>// 防抖
function debounce&lt;T extends (...args: any[]) =&gt; any&gt;(
  fn: T, delay: number
) {
  let timer: ReturnType&lt;typeof setTimeout&gt;
  return function (this: any, ...args: Parameters&lt;T&gt;) {
    clearTimeout(timer)
    timer = setTimeout(() =&gt; fn.apply(this, args), delay)
  }
}

// 节流
function throttle&lt;T extends (...args: any[]) =&gt; any&gt;(
  fn: T, interval: number
) {
  let last = 0
  return function (this: any, ...args: Parameters&lt;T&gt;) {
    const now = Date.now()
    if (now - last &gt;= interval) {
      last = now
      fn.apply(this, args)
    }
  }
}</code></pre>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">项目中的使用场景</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-gray-50">
              <th class="text-left px-4 py-2 border border-gray-200 font-medium text-gray-700">场景</th>
              <th class="text-left px-4 py-2 border border-gray-200 font-medium text-gray-700">选择</th>
              <th class="text-left px-4 py-2 border border-gray-200 font-medium text-gray-700">延迟</th>
              <th class="text-left px-4 py-2 border border-gray-200 font-medium text-gray-700">原因</th>
            </tr>
          </thead>
          <tbody class="text-gray-600">
            <tr v-for="row in scenarios" :key="row.scene">
              <td class="px-4 py-2 border border-gray-200">{{ row.scene }}</td>
              <td class="px-4 py-2 border border-gray-200 font-mono text-indigo-600">{{ row.type }}</td>
              <td class="px-4 py-2 border border-gray-200">{{ row.delay }}</td>
              <td class="px-4 py-2 border border-gray-200">{{ row.reason }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const scenarios = [
  { scene: '搜索输入框', type: 'debounce', delay: '300ms', reason: '等用户停止输入再请求' },
  { scene: '笔记自动保存', type: 'debounce', delay: '1000ms', reason: '停止编辑后保存' },
  { scene: '窗口 resize', type: 'debounce', delay: '200ms', reason: '停止拖动后重新计算' },
  { scene: '滚动加载更多', type: 'throttle', delay: '200ms', reason: '滚动中周期性检查' },
  { scene: 'AI 流式输出滚动', type: 'throttle', delay: '100ms', reason: '高频输出中平滑滚动' },
  { scene: '按钮防重复点击', type: 'throttle', delay: '1000ms', reason: '防止重复提交' },
]
</script>
