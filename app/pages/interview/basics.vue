<template>
  <div class="h-full w-full">
    <div class="h-full w-full flex flex-row">
      <div class="w-[20%] h-full bg-white border-r border-gray-200 flex flex-col overflow-y-auto p-3 gap-1">
        <button
          v-for="(q, index) in questions"
          :key="index"
          class="w-full text-left px-3 py-2.5 rounded-lg text-sm leading-snug transition-all truncate"
          :class="activeIdx === index
            ? 'bg-indigo-50 text-indigo-700 font-medium'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
          @click="activeIdx = index"
        >
          <span class="text-gray-400 mr-1.5">{{ index + 1 }}.</span>{{ q.title }}
        </button>
      </div>

      <div class="w-[80%] h-full overflow-y-auto p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-5">
          <span class="text-indigo-600 mr-2">Q{{ activeIdx + 1 }}</span>{{ questions[activeIdx]?.title }}
        </h2>
        <component :is="questions[activeIdx]?.component" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

import Q1InterfaceVsType from '~/components/interview/basics/Q1InterfaceVsType.vue'
import Q2Generics from '~/components/interview/basics/Q2Generics.vue'
import Q3UnknownVsAny from '~/components/interview/basics/Q3UnknownVsAny.vue'
import Q4DiscriminatedUnion from '~/components/interview/basics/Q4DiscriminatedUnion.vue'
import Q5TypeGuard from '~/components/interview/basics/Q5TypeGuard.vue'
import Q6PromiseMethods from '~/components/interview/basics/Q6PromiseMethods.vue'
import Q7DeepCopy from '~/components/interview/basics/Q7DeepCopy.vue'
import Q8EventLoop from '~/components/interview/basics/Q8EventLoop.vue'
import Q9DebounceThrottle from '~/components/interview/basics/Q9DebounceThrottle.vue'
import Q10AsyncControl from '~/components/interview/basics/Q10AsyncControl.vue'

interface Question {
  title: string
  component: Component
}

const activeIdx = ref(0)

const questions: Question[] = [
  { title: 'TypeScript 中 interface 和 type 的核心区别是什么？你在复杂业务类型设计里分别会怎么选？', component: Q1InterfaceVsType },
  { title: '什么场景下你会使用泛型约束？请结合你项目里的 API 响应封装举例。', component: Q2Generics },
  { title: 'unknown 和 any 的区别是什么？为什么在业务代码里通常更推荐 unknown？', component: Q3UnknownVsAny },
  { title: '如何设计一个"根据业务类型返回不同数据结构"的类型系统？', component: Q4DiscriminatedUnion },
  { title: '什么是类型守卫？你在处理上传文件、接口响应或富文本节点时是否用过？', component: Q5TypeGuard },
  { title: 'Promise.all、Promise.allSettled、Promise.race 的区别和适用场景是什么？', component: Q6PromiseMethods },
  { title: '深拷贝和浅拷贝的区别是什么？在响应式系统里为什么要谨慎做深拷贝？', component: Q7DeepCopy },
  { title: '浏览器事件循环是什么？微任务和宏任务分别有哪些？', component: Q8EventLoop },
  { title: '防抖和节流的区别是什么？你项目里分别用在了哪些场景？', component: Q9DebounceThrottle },
  { title: '为什么大文件上传、流式对话、实时语音识别这类场景对异步控制要求更高？', component: Q10AsyncControl },
]
</script>
