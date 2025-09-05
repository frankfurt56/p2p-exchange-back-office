<template>
    <div v-if="isOpen" class="fixed inset-0 z-[999] overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4">
            <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeModal"></div>
            <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl relative w-full max-w-lg overflow-hidden">
                <div class="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                    <h2 class="text-lg font-medium text-gray-800 dark:text-gray-200">
                        {{ mode === 'create' ? 'เพิ่มผู้ใช้ใหม่' : 'แก้ไขข้อมูลผู้ใช้' }}
                    </h2>
                    <button 
                        @click="closeModal" 
                        class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <icon-x class="w-5 h-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                    </button>
                </div>
                
                <form @submit.prevent="submitForm" class="px-6 py-4">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ชื่อผู้ใช้</label>
                            <input 
                                v-model="formData.username" 
                                type="text" 
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" 
                                required
                                placeholder="กรอกชื่อผู้ใช้"
                                :disabled="mode === 'edit'"
                            >
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {{ mode === 'edit' ? 'ไม่สามารถแก้ไขชื่อผู้ใช้ได้' : 'ชื่อผู้ใช้ต้องไม่ซ้ำกับที่มีอยู่' }}
                            </p>
                        </div>
                        
                        <div v-if="mode === 'create' || showPasswordField">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {{ mode === 'create' ? 'รหัสผ่าน' : 'รหัสผ่านใหม่' }}
                            </label>
                            <input 
                                v-model="formData.password" 
                                type="password" 
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" 
                                :required="mode === 'create'"
                                placeholder="กรอกรหัสผ่าน"
                                minlength="6"
                            >
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {{ mode === 'create' ? 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' : 'เว้นว่างไว้หากไม่ต้องการเปลี่ยน' }}
                            </p>
                        </div>
                        
                        <div v-if="mode === 'edit' && !showPasswordField" class="flex items-center">
                            <button 
                                type="button"
                                @click="showPasswordField = true"
                                class="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                เปลี่ยนรหัสผ่าน
                            </button>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">บทบาท</label>
                            <CustomDropdown 
                                v-model="formData.role"
                                :options="roleOptions"
                                placeholder="เลือกบทบาท"
                            />
                        </div>
                        
                        <div class="flex items-center justify-between">
                            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {{ mode === 'create' ? 'เปิดใช้งานทันที' : 'สถานะผู้ใช้' }}
                            </label>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input 
                                    v-model="formData.is_active" 
                                    type="checkbox" 
                                    class="sr-only peer"
                                >
                                <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                            </label>
                        </div>
                    </div>
                    
                    <div class="flex justify-end gap-3 mt-8 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <button 
                            type="button" 
                            @click="closeModal"
                            class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            :disabled="loading"
                        >
                            ยกเลิก
                        </button>
                        <button 
                            type="submit" 
                            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors flex items-center"
                            :disabled="loading"
                        >
                            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{{ getSubmitButtonText() }}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface User {
    id?: string
    username: string
    password?: string
    role: 'user' | 'admin' | 'moderator'
    is_active: boolean
}

interface Props {
    isOpen: boolean
    mode: 'create' | 'edit'
    user?: User | null
    loading?: boolean
}

interface Emits {
    (e: 'close'): void
    (e: 'submit', data: User): void
}

const props = withDefaults(defineProps<Props>(), {
    isOpen: false,
    mode: 'create',
    user: null,
    loading: false
})

const emit = defineEmits<Emits>()

const showPasswordField = ref(false)

const formData = ref<User>({
    username: '',
    password: '',
    role: 'user',
    is_active: true
})

const roleOptions = [
    { value: 'user', label: 'ผู้ใช้ทั่วไป' },
    { value: 'admin', label: 'ผู้ดูแลระบบ' },
    { value: 'moderator', label: 'ผู้ควบคุม' }
]

// Define resetForm function first
const resetForm = () => {
    formData.value = {
        username: '',
        password: '',
        role: 'user',
        is_active: true
    }
}

// Initialize form data when props change
watch(() => props.user, (newUser) => {
    if (newUser && props.mode === 'edit') {
        formData.value = {
            id: newUser.id,
            username: newUser.username,
            password: '',
            role: newUser.role,
            is_active: newUser.is_active
        }
    } else if (props.mode === 'create') {
        resetForm()
    }
    showPasswordField.value = false
}, { immediate: true })

// Reset form when modal opens/closes
watch(() => props.isOpen, (isOpen) => {
    if (!isOpen) {
        showPasswordField.value = false
    } else if (props.mode === 'create') {
        resetForm()
    }
})

const closeModal = () => {
    emit('close')
}

const submitForm = () => {
    const submitData = { ...formData.value }
    
    // Remove password if it's empty and mode is edit
    if (props.mode === 'edit' && !submitData.password) {
        delete submitData.password
    }
    
    emit('submit', submitData)
}

const getSubmitButtonText = () => {
    if (props.loading) {
        return props.mode === 'create' ? 'กำลังสร้าง...' : 'กำลังบันทึก...'
    }
    return props.mode === 'create' ? 'สร้างผู้ใช้' : 'บันทึกการเปลี่ยนแปลง'
}
</script>
