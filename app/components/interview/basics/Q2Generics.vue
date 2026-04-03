<template>
  <div class="space-y-6">
    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">什么是泛型约束</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        泛型约束用 <code class="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600">extends</code> 限制泛型参数的范围，确保传入的类型满足特定结构。
      </p>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">API 响应封装示例</h3>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto"><code>// 通用 API 响应结构
interface ApiRes&lt;T&gt; {
  code: number
  data: T
  msg: string
}

// 使用时约束 data 类型
interface UserInfo {
  id: number
  name: string
  avatar: string
}

const res: ApiRes&lt;UserInfo&gt; = await fetchUser()
// res.data 自动推导为 UserInfo 类型</code></pre>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">进阶：约束泛型必须是对象类型</h3>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto"><code>// 约束 T 必须是对象
function merge&lt;T extends Record&lt;string, unknown&gt;&gt;(
  target: T,
  source: Partial&lt;T&gt;
): T {
  return { ...target, ...source }
}

merge({ name: 'zhu' }, { name: 'lin' }) // ✅
merge('string', 'other')                // ❌ 类型错误</code></pre>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">常见泛型约束模式</h3>
      <ul class="space-y-2">
        <li v-for="item in patterns" :key="item.name" class="flex items-start gap-2 text-sm text-gray-600">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
          <span><code class="bg-gray-100 px-1 rounded text-xs">{{ item.code }}</code> — {{ item.desc }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
const patterns = [
  { name: 'keyof', code: 'T extends keyof U', desc: '约束 T 是 U 的键之一' },
  { name: 'record', code: 'T extends Record<string, unknown>', desc: '约束 T 是对象类型' },
  { name: 'array', code: 'T extends unknown[]', desc: '约束 T 是数组类型' },
  { name: 'function', code: 'T extends (...args: any[]) => any', desc: '约束 T 是函数类型' },
]
</script>
