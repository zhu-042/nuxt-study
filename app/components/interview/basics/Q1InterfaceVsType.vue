<template>
  <div class="space-y-6">
    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">核心区别</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-gray-50">
              <th class="text-left px-4 py-2 border border-gray-200 font-medium text-gray-700">特性</th>
              <th class="text-left px-4 py-2 border border-gray-200 font-medium text-indigo-600">interface</th>
              <th class="text-left px-4 py-2 border border-gray-200 font-medium text-violet-600">type</th>
            </tr>
          </thead>
          <tbody class="text-gray-600">
            <tr v-for="row in comparison" :key="row.feature">
              <td class="px-4 py-2 border border-gray-200 font-medium text-gray-700">{{ row.feature }}</td>
              <td class="px-4 py-2 border border-gray-200">{{ row.iface }}</td>
              <td class="px-4 py-2 border border-gray-200">{{ row.type }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">声明合并（interface 独有）</h3>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto"><code>interface User { name: string }
interface User { age: number }
// 自动合并为 { name: string; age: number }

type User = { name: string }
type User = { age: number } // ❌ 报错：重复标识符</code></pre>
      <p class="text-sm text-gray-500 mt-2">扩展第三方库类型时非常有用（如扩展 Window、ProcessEnv）。</p>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">type 独有的高级类型能力</h3>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto"><code>// 联合类型
type Status = 'pending' | 'success' | 'error'

// 条件类型
type IsString&lt;T&gt; = T extends string ? true : false

// 映射类型
type MyReadonly&lt;T&gt; = { readonly [K in keyof T]: T[K] }

// 从值中提取类型
const config = { api: '/url', timeout: 3000 }
type Config = typeof config</code></pre>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">实践选择</h3>
      <ul class="space-y-2">
        <li v-for="item in practices" :key="item.scene" class="flex items-start gap-2 text-sm text-gray-600">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
          <span><strong class="text-gray-800">{{ item.scene }}</strong> → {{ item.choice }}（{{ item.reason }}）</span>
        </li>
      </ul>
    </section>

    <div class="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 text-sm text-indigo-700">
      <strong>一句话总结：</strong>定义对象形状用 interface，需要类型运算用 type。
    </div>
  </div>
</template>

<script setup lang="ts">
const comparison = [
  { feature: '声明合并', iface: '✅ 支持同名自动合并', type: '❌ 不允许重复定义' },
  { feature: '继承', iface: 'extends 继承', type: '& 交叉类型组合' },
  { feature: '联合类型', iface: '❌ 不支持', type: '✅ A | B' },
  { feature: '条件类型', iface: '❌ 不支持', type: '✅ T extends U ? A : B' },
  { feature: '映射类型', iface: '❌ 不支持', type: '✅ { [K in keyof T]: V }' },
  { feature: '基本类型别名', iface: '❌ 不支持', type: '✅ type ID = string' },
]

const practices = [
  { scene: 'API 响应体 / 组件 Props', choice: 'interface', reason: '纯对象结构，可能需要扩展' },
  { scene: '联合类型（状态、事件）', choice: 'type', reason: 'interface 不支持' },
  { scene: '工具类型 / 条件类型', choice: 'type', reason: '需要类型运算能力' },
  { scene: '需要第三方扩展', choice: 'interface', reason: '利用声明合并' },
]
</script>
