<template>
  <div class="space-y-6">
    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">事件循环流程</h3>
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div class="flex items-center gap-2 flex-wrap text-sm">
          <span v-for="(step, i) in loopSteps" :key="i" class="flex items-center gap-2">
            <span class="px-3 py-1.5 rounded-lg font-medium" :class="step.color">{{ step.label }}</span>
            <span v-if="i < loopSteps.length - 1" class="text-gray-400">→</span>
          </span>
        </div>
      </div>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">微任务 vs 宏任务</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-violet-50 border border-violet-100 rounded-lg p-4">
          <h4 class="font-semibold text-violet-700 mb-2">微任务（优先级高）</h4>
          <ul class="space-y-1 text-sm text-gray-600">
            <li v-for="item in microTasks" :key="item">• {{ item }}</li>
          </ul>
        </div>
        <div class="bg-orange-50 border border-orange-100 rounded-lg p-4">
          <h4 class="font-semibold text-orange-700 mb-2">宏任务</h4>
          <ul class="space-y-1 text-sm text-gray-600">
            <li v-for="item in macroTasks" :key="item">• {{ item }}</li>
          </ul>
        </div>
      </div>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">经典输出顺序题</h3>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto"><code>console.log('1')                    // 同步

setTimeout(() => console.log('2'))  // 宏任务

Promise.resolve()
  .then(() => console.log('3'))     // 微任务
  .then(() => console.log('4'))     // 微任务

console.log('5')                    // 同步

// 输出顺序：1 → 5 → 3 → 4 → 2
// 同步先执行 → 清空微任务队列 → 执行宏任务</code></pre>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">Vue nextTick 的本质</h3>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto"><code>// nextTick 本质是微任务（Promise.then）
// Vue 将 DOM 更新放在微任务中批量执行

const count = ref(0)
count.value++
count.value++
count.value++
// DOM 只更新一次（批量合并）

await nextTick()
// 此时 DOM 已更新，可以安全读取</code></pre>
    </section>
  </div>
</template>

<script setup lang="ts">
const loopSteps = [
  { label: '同步代码', color: 'bg-blue-100 text-blue-700' },
  { label: '清空微任务', color: 'bg-violet-100 text-violet-700' },
  { label: '一个宏任务', color: 'bg-orange-100 text-orange-700' },
  { label: '渲染', color: 'bg-green-100 text-green-700' },
  { label: '循环 ↩', color: 'bg-gray-200 text-gray-600' },
]

const microTasks = [
  'Promise.then / catch / finally',
  'MutationObserver',
  'queueMicrotask',
  'Vue nextTick',
]

const macroTasks = [
  'setTimeout / setInterval',
  'requestAnimationFrame',
  'I/O 操作',
  'UI 渲染',
  'MessageChannel',
]
</script>
