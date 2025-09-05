<template>
  <div>
    <div class="table-responsive rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-800/60">
          <tr>
            <th v-for="col in columns" :key="col.key" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          <tr v-for="(row, index) in pagedItems" :key="row[idKey]" 
              :class="{'bg-gray-50 dark:bg-gray-800/30': index % 2 === 0}">
            <td v-for="col in columns" :key="col.key" class="px-4 py-3 align-middle">
              <slot :name="col.key" :row="row">{{ defaultCell(row, col) }}</slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showPagination && totalPages > 1" class="mt-4 flex items-center justify-end gap-2">
      <button 
        class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
        :disabled="page === 1" 
        @click="page--"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        ก่อนหน้า
      </button>
      <div class="text-sm text-gray-600 dark:text-gray-400">หน้า {{ page }} / {{ totalPages }}</div>
      <button 
        class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
        :disabled="page === totalPages" 
        @click="page++"
      >
        ถัดไป
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'

interface Column {
  key: string
  label: string
}

const props = defineProps<{
  items: any[]
  columns: Column[]
  pageSize?: number
  showPagination?: boolean
  idKey?: string
}>()

const items = toRef(props, 'items')
const columns = toRef(props, 'columns')
const pageSize = props.pageSize ?? 10
const showPagination = props.showPagination ?? true
const idKey = props.idKey ?? 'id'

const page = ref(1)

const totalPages = computed(() => Math.max(1, Math.ceil(items.value.length / pageSize)))

const pagedItems = computed(() => {
  const start = (page.value - 1) * pageSize
  return items.value.slice(start, start + pageSize)
})

function defaultCell(row: any, col: Column) {
  // Render default keys if exist
  const k = col.key
  if (k in row) return row[k]
  return ''
}

// adjust page when items change
watch(items, () => {
  if (page.value > totalPages.value) page.value = totalPages.value
})
</script>

<style scoped>
.table-responsive { 
  overflow-x: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
tbody tr:hover { 
  background-color: rgb(243 244 246) !important; 
}
.dark tbody tr:hover { 
  background-color: rgba(31, 41, 55, 0.4) !important; 
}
table { 
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}
th {
  font-weight: 500;
}
td {
  vertical-align: middle;
}
</style>
