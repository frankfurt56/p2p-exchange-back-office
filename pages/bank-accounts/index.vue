<template>
    <div>
        <div class="flex flex-wrap items-center justify-between gap-4">
            <h2 class="text-xl">จัดการบัญชีธนาคาร</h2>
            <div class="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                <button type="button" class="btn btn-primary" @click="showModal = true">
                    <icon-plus class="ltr:mr-2 rtl:ml-2" />
                    เพิ่มบัญชีใหม่
                </button>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div class="panel h-full">
                <div class="flex items-center">
                    <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary dark:text-white-light">
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 12.5C2 11.3954 2.89543 10.5 4 10.5H20C21.1046 10.5 22 11.3954 22 12.5V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V12.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M7 15.5H7.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M2 12.5L2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V12.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="font-semibold ltr:ml-3 rtl:mr-3">
                        <p class="text-xl dark:text-white-light">{{ activeBankAccounts }}</p>
                        <h5 class="text-xs text-white-dark">บัญชีที่ใช้งาน</h5>
                    </div>
                </div>
            </div>

            <div class="panel h-full">
                <div class="flex items-center">
                    <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-warning/10 text-warning dark:bg-warning dark:text-white-light">
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7V17C2 17.5304 2.21071 18.0391 2.58579 18.4142C2.96086 18.7893 3.46957 19 4 19H20C20.5304 19 21.0391 18.7893 21.4142 18.4142C21.7893 18.0391 22 17.5304 22 17V7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 22V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="font-semibold ltr:ml-3 rtl:mr-3">
                        <p class="text-xl dark:text-white-light">{{ totalBanks }}</p>
                        <h5 class="text-xs text-white-dark">ธนาคารทั้งหมด</h5>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bank Accounts Table -->
        <div class="panel mt-6">
            <div class="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                <h5 class="text-lg font-semibold dark:text-white-light">รายการบัญชีธนาคาร</h5>
                <div class="ltr:ml-auto rtl:mr-auto">
                    <input 
                        v-model="search" 
                        type="text" 
                        class="form-input w-auto" 
                        placeholder="ค้นหาบัญชี..." 
                    />
                </div>
            </div>

            <div class="datatables" v-if="!loading">
                <DataTable 
                    :items="filteredBankAccounts"
                    :columns="columns"
                    :pageSize="10"
                    :showPagination="true"
                    idKey="id"
                >
                    <template #bank_code="{ row }">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <span class="text-xs font-medium">{{ row.bank_code.toUpperCase() }}</span>
                            </div>
                            <span class="font-medium">{{ row.bank_name }}</span>
                        </div>
                    </template>

                    <template #account_number="{ row }">
                        <code class="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {{ row.account_number }}
                        </code>
                    </template>

                    <template #account_name="{ row }">
                        <span class="font-medium text-gray-900 dark:text-gray-100">
                            {{ row.account_name }}
                        </span>
                    </template>

                    <template #is_active="{ row }">
                        <span 
                            :class="row.is_active 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'"
                            class="px-2 py-1 text-xs rounded-full inline-flex items-center"
                        >
                            <span class="w-1.5 h-1.5 rounded-full mr-1" 
                                  :class="row.is_active ? 'bg-green-500' : 'bg-red-500'"></span>
                            {{ row.is_active ? 'ใช้งาน' : 'ปิดใช้งาน' }}
                        </span>
                    </template>

                    <template #created_at="{ row }">
                        {{ formatDate(row.created_at) }}
                    </template>

                    <template #actions="{ row }">
                        <div class="flex items-center gap-2">
                            <button 
                                @click="editBankAccount(row.id)"
                                class="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-500 transition-colors"
                                title="แก้ไข"
                            >
                                <icon-edit class="w-4 h-4" />
                            </button>
                            <button 
                                @click="toggleBankAccountStatus(row.id)"
                                :class="row.is_active 
                                    ? 'p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-orange-500 transition-colors' 
                                    : 'p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-green-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-green-500 transition-colors'"
                                :title="row.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'"
                            >
                                <icon-x-circle v-if="row.is_active" class="w-4 h-4" />
                                <icon-checks v-else class="w-4 h-4" />
                            </button>
                            <button 
                                @click="deleteBankAccount(row.id)"
                                class="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-red-500 transition-colors"
                                title="ลบ"
                            >
                                <icon-trash class="w-4 h-4" />
                            </button>
                        </div>
                    </template>
                </DataTable>
            </div>
            <div v-else class="flex items-center justify-center py-10">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        </div>

        <!-- Modal for Add/Edit Bank Account -->
        <div class="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto" :class="{ 'hidden': !showModal }">
            <div class="flex items-center justify-center min-h-screen px-4">
                <div class="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg my-8 text-black dark:text-white-dark">
                    <div class="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                        <h5 class="font-bold text-lg">{{ isEdit ? 'แก้ไขบัญชีธนาคาร' : 'เพิ่มบัญชีใหม่' }}</h5>
                        <button type="button" class="text-white-dark hover:text-dark" @click="closeModal">
                            <icon-x />
                        </button>
                    </div>
                    <div class="p-5">
                        <form @submit.prevent="saveBankAccount">
                            <div class="mb-5">
                                <label for="bank_code">รหัสธนาคาร *</label>
                                <CustomDropdown 
                                    v-model="formData.bank_code"
                                    :options="bankOptions"
                                    placeholder="เลือกธนาคาร"
                                />
                            </div>
                            <div class="mb-5">
                                <label for="bank_name">ชื่อธนาคาร *</label>
                                <input v-model="formData.bank_name" id="bank_name" type="text" class="form-input" placeholder="ชื่อธนาคาร" required />
                            </div>
                            <div class="mb-5">
                                <label for="account_number">เลขที่บัญชี *</label>
                                <input v-model="formData.account_number" id="account_number" type="text" class="form-input" placeholder="เลขที่บัญชี" required />
                            </div>
                            <div class="mb-5">
                                <label for="account_name">ชื่อบัญชี *</label>
                                <input v-model="formData.account_name" id="account_name" type="text" class="form-input" placeholder="ชื่อบัญชี" required />
                            </div>
                            <div class="mb-5">
                                <label class="flex items-center cursor-pointer">
                                    <input v-model="formData.is_active" type="checkbox" class="form-checkbox" />
                                    <span class="text-white-dark">เปิดใช้งาน</span>
                                </label>
                            </div>
                            <div class="flex justify-end items-center mt-8">
                                <button type="button" class="btn btn-outline-danger ltr:mr-3 rtl:ml-3" @click="closeModal">ยกเลิก</button>
                                <button type="submit" class="btn btn-primary" :disabled="saving">
                                    {{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
import { supabase } from '~/lib/supabase'
import { formatDate } from '~/utils/dateFormatter'

// Page meta
definePageMeta({
    title: 'จัดการบัญชีธนาคาร',
    middleware: 'admin-auth'
})

// Types
interface BankAccount {
    id: number
    bank_code: string
    bank_name: string
    account_number: string
    account_name: string
    is_active: boolean
    qr_code_url?: string | null
    created_at: string
}

// Reactive data
const bankAccounts = ref<BankAccount[]>([])
const filteredBankAccounts = ref<BankAccount[]>([])
const search = ref('')
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const isEdit = ref(false)

// Form data
const formData = ref({
    id: null as number | null,
    bank_code: '',
    bank_name: '',
    account_number: '',
    account_name: '',
    is_active: true
})

// Computed properties
const activeBankAccounts = computed(() => {
    return bankAccounts.value.filter(b => b.is_active).length
})

const totalBanks = computed(() => {
    const banks = new Set(bankAccounts.value.map(b => b.bank_code))
    return banks.size
})

// Table configuration
const columns = ref([
    { key: 'bank_code', label: 'ธนาคาร' },
    { key: 'account_number', label: 'เลขที่บัญชี' },
    { key: 'account_name', label: 'ชื่อบัญชี' },
    { key: 'is_active', label: 'สถานะ' },
    { key: 'created_at', label: 'สร้างเมื่อ' },
    { key: 'actions', label: 'จัดการ' }
])

// Bank options for dropdown
const bankOptions = [
    { value: '', label: 'เลือกธนาคาร' },
    { value: 'scb', label: 'ธนาคารไทยพาณิชย์ (SCB)' },
    { value: 'kbank', label: 'ธนาคารกสิกรไทย (KBANK)' },
    { value: 'bbl', label: 'ธนาคารกรุงเทพ (BBL)' },
    { value: 'ktb', label: 'ธนาคารกรุงไทย (KTB)' },
    { value: 'ttb', label: 'ธนาคารทหารไทยธนชาต (TTB)' },
    { value: 'bay', label: 'ธนาคารกรุงศรีอยุธยา (BAY)' },
    { value: 'gsb', label: 'ธนาคารออมสิน (GSB)' },
    { value: 'baac', label: 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (BAAC)' }
]

// Methods
const fetchBankAccounts = async () => {
    loading.value = true
    try {
        const { data, error } = await supabase
            .from('store_bank_accounts')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching bank accounts:', error)
            alert('เกิดข้อผิดพลาดในการโหลดข้อมูลบัญชีธนาคาร')
            return
        }

        bankAccounts.value = data || []
        filteredBankAccounts.value = [...bankAccounts.value]
    } catch (error) {
        console.error('Error fetching bank accounts:', error)
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลบัญชีธนาคาร')
    } finally {
        loading.value = false
    }
}

const filterBankAccounts = () => {
    if (!search.value) {
        filteredBankAccounts.value = [...bankAccounts.value]
    } else {
        filteredBankAccounts.value = bankAccounts.value.filter(account =>
            account.bank_name.toLowerCase().includes(search.value.toLowerCase()) ||
            account.bank_code.toLowerCase().includes(search.value.toLowerCase()) ||
            account.account_number.toLowerCase().includes(search.value.toLowerCase()) ||
            account.account_name.toLowerCase().includes(search.value.toLowerCase())
        )
    }
}

const resetForm = () => {
    formData.value = {
        id: null,
        bank_code: '',
        bank_name: '',
        account_number: '',
        account_name: '',
        is_active: true
    }
}

const closeModal = () => {
    showModal.value = false
    isEdit.value = false
    resetForm()
}

const editBankAccount = (id: number) => {
    const account = bankAccounts.value.find(a => a.id === id)
    if (account) {
        formData.value = { 
            id: account.id,
            bank_code: account.bank_code,
            bank_name: account.bank_name,
            account_number: account.account_number,
            account_name: account.account_name,
            is_active: account.is_active
        }
        isEdit.value = true
        showModal.value = true
    }
}

const saveBankAccount = async () => {
    // Validation
    if (!formData.value.bank_code) {
        alert('กรุณาเลือกธนาคาร')
        return
    }
    if (!formData.value.bank_name.trim()) {
        alert('กรุณากรอกชื่อธนาคาร')
        return
    }
    if (!formData.value.account_number.trim()) {
        alert('กรุณากรอกเลขที่บัญชี')
        return
    }
    if (!formData.value.account_name.trim()) {
        alert('กรุณากรอกชื่อบัญชี')
        return
    }

    saving.value = true
    try {
        if (isEdit.value) {
            // Update existing bank account
            const { data, error } = await supabase
                .from('store_bank_accounts')
                .update({
                    bank_code: formData.value.bank_code,
                    bank_name: formData.value.bank_name,
                    account_number: formData.value.account_number,
                    account_name: formData.value.account_name,
                    is_active: formData.value.is_active
                })
                .eq('id', formData.value.id)
                .select()

            if (error) {
                console.error('Error updating bank account:', error)
                alert('เกิดข้อผิดพลาดในการแก้ไขบัญชีธนาคาร')
                return
            }

            // Update local data
            const index = bankAccounts.value.findIndex(a => a.id === formData.value.id)
            if (index !== -1 && data && data[0]) {
                bankAccounts.value[index] = data[0]
            }
            alert('แก้ไขบัญชีธนาคารเรียบร้อยแล้ว')
        } else {
            // Create new bank account
            const { data, error } = await supabase
                .from('store_bank_accounts')
                .insert({
                    bank_code: formData.value.bank_code,
                    bank_name: formData.value.bank_name,
                    account_number: formData.value.account_number,
                    account_name: formData.value.account_name,
                    is_active: formData.value.is_active
                })
                .select()

            if (error) {
                console.error('Error creating bank account:', error)
                alert('เกิดข้อผิดพลาดในการเพิ่มบัญชีธนาคาร')
                return
            }

            if (data && data[0]) {
                bankAccounts.value.push(data[0])
            }
            alert('เพิ่มบัญชีธนาคารเรียบร้อยแล้ว')
        }
        
        filterBankAccounts()
        closeModal()
    } catch (error) {
        console.error('Error saving bank account:', error)
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
        saving.value = false
    }
}

const toggleBankAccountStatus = async (id: number) => {
    try {
        const account = bankAccounts.value.find(a => a.id === id)
        if (account) {
            const newStatus = !account.is_active
            
            const { error } = await supabase
                .from('store_bank_accounts')
                .update({ is_active: newStatus })
                .eq('id', id)

            if (error) {
                console.error('Error toggling bank account status:', error)
                alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ')
                return
            }

            account.is_active = newStatus
            alert('เปลี่ยนสถานะบัญชีธนาคารเรียบร้อยแล้ว')
            filterBankAccounts()
        }
    } catch (error) {
        console.error('Error toggling bank account status:', error)
        alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ')
    }
}

const deleteBankAccount = async (id: number) => {
    const confirmed = confirm('คุณแน่ใจหรือไม่ที่จะลบบัญชีธนาคารนี้?')

    if (confirmed) {
        try {
            const { error } = await supabase
                .from('store_bank_accounts')
                .delete()
                .eq('id', id)

            if (error) {
                console.error('Error deleting bank account:', error)
                alert('เกิดข้อผิดพลาดในการลบบัญชีธนาคาร')
                return
            }

            const index = bankAccounts.value.findIndex(a => a.id === id)
            if (index !== -1) {
                bankAccounts.value.splice(index, 1)
                alert('ลบบัญชีธนาคารเรียบร้อยแล้ว')
                filterBankAccounts()
            }
        } catch (error) {
            console.error('Error deleting bank account:', error)
            alert('เกิดข้อผิดพลาดในการลบบัญชีธนาคาร')
        }
    }
}

// Watchers
watch(search, filterBankAccounts)

// Auto-fill bank name when bank code changes
watch(() => formData.value.bank_code, (newBankCode) => {
    const bankNames: Record<string, string> = {
        'scb': 'ธนาคารไทยพาณิชย์',
        'kbank': 'ธนาคารกสิกรไทย',
        'bbl': 'ธนาคารกรุงเทพ',
        'ktb': 'ธนาคารกรุงไทย',
        'ttb': 'ธนาคารทหารไทยธนชาต',
        'bay': 'ธนาคารกรุงศรีอยุธยา',
        'gsb': 'ธนาคารออมสิน',
        'baac': 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร'
    }
    
    if (newBankCode && bankNames[newBankCode]) {
        formData.value.bank_name = bankNames[newBankCode]
    }
})

// Lifecycle
onMounted(() => {
    fetchBankAccounts()
})
</script>
