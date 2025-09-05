<template>
    <div>
        <!-- Header Section -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-xl font-medium text-gray-800 dark:text-white">จัดการผู้ใช้</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">จัดการข้อมูลผู้ใช้ทั้งหมดในระบบ</p>
            </div>
            <button 
                @click="showAddModal = true"
                class="btn text-black rounded-md flex items-center gap-2 "
            >
                <icon-plus class="w-4 h-4" />
                <span>เพิ่มผู้ใช้ใหม่</span>
            </button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
            <div class="panel border border-gray-200 dark:border-gray-700">
                <div class="flex items-center">
                    <span class="bg-blue-100 p-3 rounded-full mr-3 dark:bg-blue-900/30">
                        <icon-users class="w-6 h-6 text-blue-500 dark:text-blue-400" />
                    </span>
                    <div>
                        <h3 class="text-lg font-semibold">{{ stats.totalUsers }}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">ผู้ใช้ทั้งหมด</p>
                    </div>
                </div>
            </div>
            
            <div class="panel border border-gray-200 dark:border-gray-700">
                <div class="flex items-center">
                    <span class="bg-green-100 p-3 rounded-full mr-3 dark:bg-green-900/30">
                        <icon-circle-check class="w-6 h-6 text-green-500 dark:text-green-400" />
                    </span>
                    <div>
                        <h3 class="text-lg font-semibold">{{ stats.activeUsers }}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">ผู้ใช้ที่ใช้งานอยู่</p>
                    </div>
                </div>
            </div>
            
            <div class="panel border border-gray-200 dark:border-gray-700">
                <div class="flex items-center">
                    <span class="bg-red-100 p-3 rounded-full mr-3 dark:bg-red-900/30">
                        <icon-x-circle class="w-6 h-6 text-red-500 dark:text-red-400" />
                    </span>
                    <div>
                        <h3 class="text-lg font-semibold">{{ stats.bannedUsers }}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">ผู้ใช้ที่ถูกระงับ</p>
                    </div>
                </div>
            </div>
            
            <div class="panel border border-gray-200 dark:border-gray-700">
                <div class="flex items-center">
                    <span class="bg-purple-100 p-3 rounded-full mr-3 dark:bg-purple-900/30">
                        <icon-user class="w-6 h-6 text-purple-500 dark:text-purple-400" />
                    </span>
                    <div>
                        <h3 class="text-lg font-semibold">{{ stats.adminUsers }}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">ผู้ดูแลระบบ</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filter Section -->
        <div class="panel mb-6 border border-gray-200 dark:border-gray-700">
            <h3 class="mb-4 font-medium text-sm text-gray-500 dark:text-gray-400">ค้นหาและตัวกรอง</h3>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <!-- Search Input -->
                <div class="md:col-span-6 lg:col-span-6">
                    <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">ค้นหา</label>
                    <div class="relative">
                        <span class="absolute left-3 top-3 text-gray-400">
                            <icon-search class="w-4 h-4" />
                        </span>
                        <input 
                            v-model="searchTerm" 
                            type="text" 
                            class="form-input py-2 pl-10" 
                            placeholder="ค้นหาชื่อผู้ใช้ หรือ อีเมล..."
                        >
                    </div>
                </div>
                
                <!-- Status Filter -->
                <div class="md:col-span-3 lg:col-span-3">
                    <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">สถานะ</label>
                    <select v-model="statusFilter" class="form-select py-2">
                        <option value="">ทั้งหมด</option>
                        <option value="active">ใช้งานอยู่</option>
                        <option value="inactive">ถูกระงับ</option>
                    </select>
                </div>
                
                <!-- Role Filter -->
                <div class="md:col-span-3 lg:col-span-3">
                    <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">บทบาท</label>
                    <select v-model="roleFilter" class="form-select py-2">
                        <option value="">ทั้งหมด</option>
                        <option value="admin">ผู้ดูแลระบบ</option>
                        <option value="user">ผู้ใช้ทั่วไป</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Users Table -->
        <div class="panel">
            <DataTable :items="filteredUsers" :columns="tableColumns" :pageSize="10" :showPagination="true" idKey="id">
                <template #user="{ row }">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center font-medium">
                            {{ row.username.charAt(0).toUpperCase() }}
                        </div>
                        <div>
                            <div class="font-medium text-gray-900 dark:text-gray-100">{{ row.username }}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">{{ row.email }}</div>
                        </div>
                    </div>
                </template>

                <template #status="{ row }">
                    <span 
                        :class="row.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'"
                        class="px-2 py-1 text-xs rounded-full inline-flex items-center"
                    >
                        <span class="w-1.5 h-1.5 rounded-full mr-1" 
                              :class="row.is_active ? 'bg-green-500' : 'bg-red-500'"></span>
                        {{ row.is_active ? 'ใช้งานอยู่' : 'ถูกระงับ' }}
                    </span>
                </template>

                <template #role="{ row }">
                    <span 
                        :class="row.role === 'admin' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'"
                        class="px-2 py-1 text-xs rounded-full inline-flex items-center"
                    >
                        {{ row.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป' }}
                    </span>
                </template>

                <template #created_at="{ row }">{{ formatDate(row.created_at) }}</template>
                <template #last_transaction="{ row }">{{ row.last_transaction || 'ไม่มีธุรกรรม' }}</template>

                <template #actions="{ row }">
                    <div class="flex items-center gap-2">
                        <button 
                            @click="editUser(row)" 
                            class="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-500 transition-colors" 
                            title="แก้ไข"
                        >
                            <icon-edit class="w-4 h-4" />
                        </button>
                        <button 
                            @click="deleteUser(row)" 
                            class="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-red-500 transition-colors" 
                            title="ลบ"
                        >
                            <icon-trash class="w-4 h-4" />
                        </button>
                    </div>
                </template>
            </DataTable>

            <!-- Loading & Empty handled by page state -->
            <div v-if="loading" class="flex items-center justify-center p-8 rounded-md bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700">
                <div class="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500"></div>
                <span class="ml-3 text-sm text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูล...</span>
            </div>

            <div v-if="!loading && filteredUsers.length === 0" class="text-center p-8 rounded-md bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700">
                <div class="inline-flex items-center justify-center p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <icon-users class="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p class="text-gray-500 dark:text-gray-400">ไม่พบข้อมูลผู้ใช้</p>
                <button 
                    @click="showAddModal = true"
                    class="mt-4 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-md text-sm transition-colors"
                >
                    เพิ่มผู้ใช้ใหม่
                </button>
            </div>
        </div>




    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminAuthStore } from '~/stores/adminAuth'
import DataTable from '~/components/DataTable.vue'

// Page Meta
definePageMeta({
    middleware: 'admin-auth'
})

// SEO
useHead({
    title: 'จัดการผู้ใช้ | P2P Exchange Admin'
})

// State
const authStore = useAdminAuthStore()
const loading = ref(true)
const showAddModal = ref(false)
const creatingUser = ref(false)
const searchTerm = ref('')
const statusFilter = ref('')
const roleFilter = ref('')

// Mock data - จะแทนที่ด้วย API จริงในภายหลัง
const users = ref([
    {
        id: '1',
        username: 'john_doe',
        email: 'john@example.com',
        full_name: 'John Doe',
        role: 'user',
        is_active: true,
        created_at: '2024-01-15T10:30:00Z',
        last_transaction: '2024-09-01'
    },
    {
        id: '2', 
        username: 'admin_user',
        email: 'admin@p2p.com',
        full_name: 'Admin User',
        role: 'admin',
        is_active: true,
        created_at: '2024-01-01T08:00:00Z',
        last_transaction: '2024-09-04'
    },
    {
        id: '3',
        username: 'jane_smith',
        email: 'jane@example.com', 
        full_name: 'Jane Smith',
        role: 'user',
        is_active: false,
        created_at: '2024-02-20T14:20:00Z',
        last_transaction: '2024-08-15'
    }
])

const newUser = ref({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'user',
    is_active: true
})

// Computed
const stats = computed(() => ({
    totalUsers: users.value.length,
    activeUsers: users.value.filter(u => u.is_active).length,
    bannedUsers: users.value.filter(u => !u.is_active).length,
    adminUsers: users.value.filter(u => u.role === 'admin').length
}))

const filteredUsers = computed(() => {
    let filtered = users.value
    
    if (searchTerm.value) {
        filtered = filtered.filter(user => 
            user.username.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.value.toLowerCase())
        )
    }
    
    if (statusFilter.value) {
        filtered = filtered.filter(user => 
            statusFilter.value === 'active' ? user.is_active : !user.is_active
        )
    }
    
    if (roleFilter.value) {
        filtered = filtered.filter(user => user.role === roleFilter.value)
    }
    
    return filtered
})

// Table column definitions for DataTable component
const tableColumns = [
    { key: 'user', label: 'ผู้ใช้' },
    { key: 'status', label: 'สถานะ' },
    { key: 'role', label: 'บทบาท' },
    { key: 'created_at', label: 'วันที่สมัคร' },
    { key: 'last_transaction', label: 'ธุรกรรมล่าสุด' },
    { key: 'actions', label: 'การกระทำ' },
]

// Methods
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const createUser = async () => {
    try {
        creatingUser.value = true
        
        // Mock API call - จะแทนที่ด้วย API จริง
        const mockUser = {
            id: Date.now().toString(),
            ...newUser.value,
            created_at: new Date().toISOString(),
            last_transaction: ''
        }
        
        // สำหรับการใช้งานจริง ตรงนี้จะเรียก API เพื่อบันทึกข้อมูล
        await new Promise(resolve => setTimeout(resolve, 800))
        
        users.value.push(mockUser)
        
        // Reset form
        newUser.value = {
            username: '',
            email: '',
            password: '',
            full_name: '',
            role: 'user',
            is_active: true
        }
        
        showAddModal.value = false
        
        // Show success message
        toast.success('เพิ่มผู้ใช้เรียบร้อยแล้ว')
        
    } catch (error) {
        console.error('Error creating user:', error)
        toast.error('เกิดข้อผิดพลาดในการเพิ่มผู้ใช้')
    } finally {
        creatingUser.value = false
    }
}

// Modal สำหรับแก้ไขผู้ใช้
const showEditModal = ref(false)
const updatingUser = ref(false)
const editingUser = ref({
    id: '',
    username: '',
    email: '',
    full_name: '',
    role: 'user',
    is_active: true,
    created_at: '',
    last_transaction: ''
})

const editUser = (user: any) => {
    editingUser.value = { ...user }
    showEditModal.value = true
}

const updateUser = async () => {
    try {
        updatingUser.value = true
        
        // สำหรับการใช้งานจริง ตรงนี้จะเรียก API เพื่อบันทึกข้อมูล
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // อัพเดตข้อมูลในตาราง
        const index = users.value.findIndex(u => u.id === editingUser.value.id)
        if (index !== -1) {
            users.value[index] = { ...editingUser.value }
        }
        
        // แสดงข้อความสำเร็จ
        alert('บันทึกข้อมูลผู้ใช้เรียบร้อยแล้ว')
        showEditModal.value = false
    } catch (error) {
        console.error('Error updating user:', error)
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
        updatingUser.value = false
    }
}

// Import หรือสร้าง toast service
const toast = {
    success: (message: string) => {
        alert(message) // ตอนนี้จะใช้ alert ไปก่อน แต่ในการใช้งานจริงควรใช้ toast component
    },
    error: (message: string) => {
        alert(message)
    }
}

const toggleUserStatus = async (user: any) => {
    try {
        const newStatus = !user.is_active
        
        // สำหรับการใช้งานจริง ตรงนี้จะเรียก API เพื่อเปลี่ยนสถานะผู้ใช้
        await new Promise(resolve => setTimeout(resolve, 500))
        
        user.is_active = newStatus
        
        const status = newStatus ? 'เปิดใช้งาน' : 'ระงับ'
        toast.success(`${status}ผู้ใช้ ${user.username} เรียบร้อยแล้ว`)
    } catch (error) {
        console.error('Error toggling user status:', error)
        toast.error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะผู้ใช้')
    }
}

// Modal สำหรับยืนยันการลบผู้ใช้
const showDeleteModal = ref(false)
const deletingUser = ref(false)
const userToDelete = ref<any>(null)

const deleteUser = (user: any) => {
    userToDelete.value = user
    showDeleteModal.value = true
}

const confirmDeleteUser = async () => {
    try {
        deletingUser.value = true
        
        // สำหรับการใช้งานจริง ตรงนี้จะเรียก API เพื่อลบข้อมูล
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // ลบข้อมูลในตาราง
        const index = users.value.findIndex(u => u.id === userToDelete.value.id)
        if (index > -1) {
            users.value.splice(index, 1)
            alert('ลบผู้ใช้เรียบร้อยแล้ว')
        }
        
        showDeleteModal.value = false
    } catch (error) {
        console.error('Error deleting user:', error)
        alert('เกิดข้อผิดพลาดในการลบข้อมูล')
    } finally {
        deletingUser.value = false
    }
}

// Lifecycle
onMounted(async () => {
    // Simulate loading
    setTimeout(() => {
        loading.value = false
    }, 1000)
})
</script>

<style scoped>
.table-responsive {
    overflow-x: auto;
}

.table-hover tbody tr:hover {
    background-color: rgb(249 250 251);
}

.dark .table-hover tbody tr:hover {
    background-color: rgba(31, 41, 55, 0.5);
}

.badge {
    display: inline-flex;
    align-items: center;
    padding: 0.125rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
}

.badge-outline-success {
    color: rgb(22 101 52);
    background-color: rgb(220 252 231);
    border: 1px solid rgb(134 239 172);
}

.badge-outline-danger {
    color: rgb(153 27 27);
    background-color: rgb(254 226 226);
    border: 1px solid rgb(252 165 165);
}

.badge-outline-primary {
    color: rgb(30 64 175);
    background-color: rgb(219 234 254);
    border: 1px solid rgb(147 197 253);
}

.badge-outline-secondary {
    color: rgb(55 65 81);
    background-color: rgb(243 244 246);
    border: 1px solid rgb(209 213 219);
}

.form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: rgb(55 65 81);
    margin-bottom: 0.25rem;
}

.dark .form-label {
    color: rgb(229 231 235);
}
</style>
