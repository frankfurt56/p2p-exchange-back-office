<template>
    <div v-if="isOpen" class="fixed inset-0 z-[999] overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4">
            <div class="fixed inset-0 bg-black bg-opacity-50" @click="handleBackdropClick"></div>
            <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl relative w-full max-w-md overflow-hidden transform transition-all">
                <!-- Header -->
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 mx-auto w-12 h-12 flex items-center justify-center rounded-full" 
                             :class="iconBgClass">
                            <svg v-if="type === 'danger'" class="w-6 h-6" :class="iconTextClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <svg v-else-if="type === 'info'" class="w-6 h-6" :class="iconTextClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <svg v-else class="w-6 h-6" :class="iconTextClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Content -->
                <div class="px-6 py-4">
                    <div class="text-center">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {{ title }}
                        </h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            {{ message }}
                        </p>
                    </div>
                </div>

                <!-- Actions -->
                <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button 
                        type="button" 
                        @click="handleCancel"
                        class="w-full sm:w-auto px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        :disabled="loading"
                    >
                        {{ cancelText }}
                    </button>
                    <button 
                        type="button" 
                        @click="handleConfirm"
                        :class="confirmButtonClass"
                        class="w-full sm:w-auto px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                        :disabled="loading"
                    >
                        <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{{ loading ? loadingText : confirmText }}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    loadingText?: string
    type?: 'danger' | 'info' | 'warning'
    loading?: boolean
    preventBackdropClose?: boolean
}

interface Emits {
    (e: 'confirm'): void
    (e: 'cancel'): void
    (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
    confirmText: 'ยืนยัน',
    cancelText: 'ยกเลิก',
    loadingText: 'กำลังดำเนินการ...',
    type: 'danger',
    loading: false,
    preventBackdropClose: false
})

const emit = defineEmits<Emits>()

// Computed styles based on type
const iconBgClass = computed(() => {
    switch (props.type) {
        case 'danger':
            return 'bg-red-100 dark:bg-red-900/30'
        case 'info':
            return 'bg-blue-100 dark:bg-blue-900/30'
        case 'warning':
            return 'bg-yellow-100 dark:bg-yellow-900/30'
        default:
            return 'bg-red-100 dark:bg-red-900/30'
    }
})

const iconTextClass = computed(() => {
    switch (props.type) {
        case 'danger':
            return 'text-red-600 dark:text-red-400'
        case 'info':
            return 'text-blue-600 dark:text-blue-400'
        case 'warning':
            return 'text-yellow-600 dark:text-yellow-400'
        default:
            return 'text-red-600 dark:text-red-400'
    }
})

const confirmButtonClass = computed(() => {
    switch (props.type) {
        case 'danger':
            return 'bg-red-600 hover:bg-red-700 text-white'
        case 'info':
            return 'bg-blue-600 hover:bg-blue-700 text-white'
        case 'warning':
            return 'bg-yellow-600 hover:bg-yellow-700 text-white'
        default:
            return 'bg-red-600 hover:bg-red-700 text-white'
    }
})

const handleConfirm = () => {
    emit('confirm')
}

const handleCancel = () => {
    emit('cancel')
    emit('close')
}

const handleBackdropClick = () => {
    if (!props.preventBackdropClose && !props.loading) {
        emit('cancel')
        emit('close')
    }
}

// Handle ESC key
const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && !props.preventBackdropClose && !props.loading) {
        emit('cancel')
        emit('close')
    }
}

// Add/remove event listener for ESC key
watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        document.addEventListener('keydown', handleKeydown)
    } else {
        document.removeEventListener('keydown', handleKeydown)
    }
})

// Cleanup on unmount
onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
})
</script>
