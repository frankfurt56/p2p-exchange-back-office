<template>
    <div class="relative" data-dropdown>
        <button 
            type="button"
            @click="toggleDropdown"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white bg-white text-left flex items-center justify-between"
            :class="{ 'border-blue-500': isOpen }"
        >
            <span class="truncate">{{ selectedLabel || placeholder }}</span>
            <svg 
                class="w-4 h-4 transition-transform flex-shrink-0 ml-2" 
                :class="{ 'rotate-180': isOpen }" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
            >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
        </button>
        
        <!-- Dropdown Menu -->
        <div 
            v-if="isOpen" 
            class="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
        >
            <button 
                v-for="option in options"
                :key="option.value"
                type="button"
                @click="selectOption(option)"
                class="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-md last:rounded-b-md transition-colors"
                :class="{ 
                    'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400': modelValue === option.value,
                    'text-gray-900 dark:text-gray-100': modelValue !== option.value
                }"
            >
                {{ option.label }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
interface DropdownOption {
    value: string | number
    label: string
}

interface Props {
    modelValue: string | number | null
    options: DropdownOption[]
    placeholder?: string
}

interface Emits {
    (e: 'update:modelValue', value: string | number): void
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'เลือก...'
})

const emit = defineEmits<Emits>()

const isOpen = ref(false)

const selectedLabel = computed(() => {
    const selected = props.options.find(option => option.value === props.modelValue)
    return selected?.label || ''
})

const toggleDropdown = () => {
    isOpen.value = !isOpen.value
}

const selectOption = (option: DropdownOption) => {
    emit('update:modelValue', option.value)
    isOpen.value = false
}

// Close dropdown when clicking outside
onMounted(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (!isOpen.value) return
        
        const target = event.target as HTMLElement
        const dropdownContainer = target.closest('[data-dropdown]')
        
        if (!dropdownContainer) {
            isOpen.value = false
        }
    }
    
    document.addEventListener('click', handleClickOutside)
    
    onUnmounted(() => {
        document.removeEventListener('click', handleClickOutside)
    })
})

// Close dropdown on escape key
onMounted(() => {
    const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isOpen.value) {
            isOpen.value = false
        }
    }
    
    document.addEventListener('keydown', handleEscape)
    
    onUnmounted(() => {
        document.removeEventListener('keydown', handleEscape)
    })
})
</script>
