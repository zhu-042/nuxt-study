<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Pinia 计数器</h1>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div class="text-center mb-6">
        <div class="text-6xl font-bold tabular-nums" :class="count >= 0 ? 'text-indigo-600' : 'text-red-500'">
          {{ count }}
        </div>
        <p class="text-sm text-gray-400 mt-2">
          双倍值: <span class="font-semibold text-gray-600">{{ doubleCount }}</span>
        </p>
      </div>

      <div class="flex items-center justify-center gap-3">
        <button
          class="px-4 py-2 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
          @click="decrement"
        >
          - 1
        </button>
        <button
          class="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
          @click="reset"
        >
          重置
        </button>
        <button
          class="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 font-medium hover:bg-indigo-100 transition-colors"
          @click="increment"
        >
          + 1
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 class="font-semibold text-gray-900 mb-3">自定义增量</h2>
      <div class="flex items-center gap-3">
        <input
          v-model.number="customAmount"
          type="number"
          class="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="数值"
        />
        <button
          class="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
          @click="incrementBy(customAmount)"
        >
          增加
        </button>
      </div>
    </div>

    <div class="mt-6 p-4 bg-gray-800 rounded-xl text-sm font-mono text-gray-300">
      <p class="text-gray-500 mb-2">// Store 状态快照</p>
      <p>count: <span class="text-green-400">{{ count }}</span></p>
      <p>doubleCount: <span class="text-green-400">{{ doubleCount }}</span></p>
      <p>isPositive: <span class="text-yellow-400">{{ isPositive }}</span></p>
    </div>
  </div>
</template>

<script setup lang="ts">
const counterStore = useCounterStore()
const { count, doubleCount, isPositive } = storeToRefs(counterStore)
const { increment, decrement, reset, incrementBy } = counterStore

const customAmount = ref(5)
</script>
