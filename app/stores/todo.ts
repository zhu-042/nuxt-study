export interface TodoItem {
  id: number
  text: string
  done: boolean
  createdAt: Date
}

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<TodoItem[]>([])
  let nextId = 1

  const totalCount = computed(() => todos.value.length)
  const doneCount = computed(() => todos.value.filter(t => t.done).length)
  const undoneCount = computed(() => totalCount.value - doneCount.value)

  function addTodo(text: string) {
    if (!text.trim()) return
    todos.value.push({
      id: nextId++,
      text: text.trim(),
      done: false,
      createdAt: new Date(),
    })
  }

  function removeTodo(id: number) {
    todos.value = todos.value.filter(t => t.id !== id)
  }

  function toggleTodo(id: number) {
    const todo = todos.value.find(t => t.id === id)
    if (todo) todo.done = !todo.done
  }

  function clearDone() {
    todos.value = todos.value.filter(t => !t.done)
  }

  return { todos, totalCount, doneCount, undoneCount, addTodo, removeTodo, toggleTodo, clearDone }
})
