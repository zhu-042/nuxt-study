<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">待办列表</h1>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <form class="flex gap-3" @submit.prevent="handleAdd">
        <input
          v-model="newTodo"
          type="text"
          placeholder="输入待办事项..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          type="submit"
          class="px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!newTodo.trim()"
        >
          添加
        </button>
      </form>
    </div>

    <div class="flex items-center justify-between mb-4">
      <div class="flex gap-4 text-sm text-gray-500">
        <span>全部 <strong class="text-gray-900">{{ totalCount }}</strong></span>
        <span>待完成 <strong class="text-indigo-600">{{ undoneCount }}</strong></span>
        <span>已完成 <strong class="text-green-600">{{ doneCount }}</strong></span>
      </div>
      <button
        v-if="doneCount > 0"
        class="text-sm text-red-500 hover:text-red-600 transition-colors"
        @click="clearDone"
      >
        清除已完成
      </button>
    </div>

    <div v-if="todos.length === 0" class="text-center py-12 text-gray-400">
      <p class="text-4xl mb-2">📝</p>
      <p>还没有待办事项，添加一个吧</p>
    </div>

    <TransitionGroup
      v-else
      name="list"
      tag="ul"
      class="space-y-2"
    >
      <li
        v-for="todo in todos"
        :key="todo.id"
        class="group flex items-center gap-3 bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 hover:shadow-md transition-all"
      >
        <button
          class="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
          :class="todo.done
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-indigo-400'"
          @click="toggleTodo(todo.id)"
        >
          <svg v-if="todo.done" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <span
          class="flex-1 text-gray-800 transition-all"
          :class="{ 'line-through text-gray-400': todo.done }"
        >
          {{ todo.text }}
        </span>
        <button
          class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
          @click="removeTodo(todo.id)"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </li>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const todoStore = useTodoStore()
const { todos, totalCount, doneCount, undoneCount } = storeToRefs(todoStore)
const { addTodo, removeTodo, toggleTodo, clearDone } = todoStore

const newTodo = ref('')

function handleAdd() {
  addTodo(newTodo.value)
  newTodo.value = ''
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
