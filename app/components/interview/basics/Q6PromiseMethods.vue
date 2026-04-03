<template>
  <div class="space-y-6">
    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">三者对比</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-gray-50">
              <th class="text-left px-4 py-2 border border-gray-200 font-medium text-gray-700">方法</th>
              <th class="text-left px-4 py-2 border border-gray-200 font-medium text-gray-700">行为</th>
              <th class="text-left px-4 py-2 border border-gray-200 font-medium text-gray-700">适用场景</th>
            </tr>
          </thead>
          <tbody class="text-gray-600">
            <tr v-for="row in methods" :key="row.name">
              <td class="px-4 py-2 border border-gray-200 font-mono text-indigo-600">{{ row.name }}</td>
              <td class="px-4 py-2 border border-gray-200">{{ row.behavior }}</td>
              <td class="px-4 py-2 border border-gray-200">{{ row.usage }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">Promise.all — 全部成功才成功</h3>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto"><code>// 页面初始化：多个接口都必须成功
const [user, config, permissions] = await Promise.all([
  fetchUser(),
  fetchConfig(),
  fetchPermissions(),
])
// 任一失败 → 整体 reject → 进入 catch</code></pre>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">Promise.allSettled — 允许部分失败</h3>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto"><code>// 批量操作：部分失败不影响其他
const results = await Promise.allSettled(
  files.map(file =&gt; uploadFile(file))
)

const succeeded = results.filter(r =&gt; r.status === 'fulfilled')
const failed = results.filter(r =&gt; r.status === 'rejected')
console.log(`成功 ${succeeded.length}，失败 ${failed.length}`)</code></pre>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">Promise.race — 竞速 / 超时控制</h3>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto"><code>// 请求超时控制
function withTimeout&lt;T&gt;(promise: Promise&lt;T&gt;, ms: number): Promise&lt;T&gt; {
  const timeout = new Promise&lt;never&gt;((_, reject) =&gt;
    setTimeout(() =&gt; reject(new Error('Timeout')), ms)
  )
  return Promise.race([promise, timeout])
}

const data = await withTimeout(fetchData(), 5000)</code></pre>
    </section>

    <div class="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-sm text-amber-800">
      <strong>补充：</strong>Promise.any（ES2021）— 任一成功即 resolve，全部失败才 reject。适合多源竞速取最快成功的场景。
    </div>
  </div>
</template>

<script setup lang="ts">
const methods = [
  { name: 'Promise.all', behavior: '全部成功 → resolve；任一失败 → 立即 reject', usage: '页面初始化加载多接口' },
  { name: 'Promise.allSettled', behavior: '等所有结束，返回每个的状态和结果', usage: '批量操作允许部分失败' },
  { name: 'Promise.race', behavior: '第一个完成的决定结果', usage: '超时控制、竞速请求' },
]
</script>
