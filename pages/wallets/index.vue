<template>
    <div>
        <div class="flex flex-wrap items-center justify-between gap-4">
            <h2 class="text-xl">จัดการข้อมูลกระเป๋า</h2>
            <div class="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                <button type="button" class="btn btn-primary" @click="showModal = true">
                    <icon-plus class="ltr:mr-2 rtl:ml-2" />
                    เพิ่มกระเป๋าใหม่
                </button>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div class="panel h-full">
                <div class="flex items-center">
                    <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary dark:text-white-light">
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="font-semibold ltr:ml-3 rtl:mr-3">
                        <p class="text-xl dark:text-white-light">{{ activeWallets }}</p>
                        <h5 class="text-xs text-white-dark">กระเป๋าที่ใช้งาน</h5>
                    </div>
                </div>
            </div>

            <div class="panel h-full">
                <div class="flex items-center">
                    <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-warning/10 text-warning dark:bg-warning dark:text-white-light">
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="font-semibold ltr:ml-3 rtl:mr-3">
                        <p class="text-xl dark:text-white-light">{{ totalNetworks }}</p>
                        <h5 class="text-xs text-white-dark">เครือข่ายทั้งหมด</h5>
                    </div>
                </div>
            </div>
        </div>

        <!-- Wallets Table -->
        <div class="panel mt-6">
            <div class="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                <h5 class="text-lg font-semibold dark:text-white-light">รายการกระเป๋า</h5>
                <div class="ltr:ml-auto rtl:mr-auto">
                    <input 
                        v-model="search" 
                        type="text" 
                        class="form-input w-auto" 
                        placeholder="ค้นหากระเป๋า..." 
                    />
                </div>
            </div>

            <div class="datatables" v-if="!loading">
                <DataTable 
                    :items="filteredWallets"
                    :columns="columns"
                    :pageSize="10"
                    :showPagination="true"
                    idKey="id"
                >
                    <template #network="{ row }">
                        <span 
                            :class="{
                                'badge badge-outline-success': row.network === 'TRC20',
                                'badge badge-outline-primary': row.network === 'ERC20',
                                'badge badge-outline-warning': row.network === 'BEP20',
                                'badge badge-outline-secondary': !['TRC20', 'ERC20', 'BEP20'].includes(row.network)
                            }"
                        >
                            {{ row.network }}
                        </span>
                    </template>

                    <template #wallet_address="{ row }">
                        <code class="text-xs">
                            {{ row.wallet_address.length > 20 ? 
                               row.wallet_address.substr(0, 10) + '...' + row.wallet_address.substr(-10) : 
                               row.wallet_address }}
                        </code>
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

                    <template #created_at_th="{ row }">
                        {{ new Date(row.created_at_th).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short', 
                            day: 'numeric'
                        }) }}
                    </template>

                    <template #actions="{ row }">
                        <div class="flex items-center gap-2">
                            <button 
                                @click="editWallet(row.id)"
                                class="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-500 transition-colors"
                                title="แก้ไข"
                            >
                                <icon-edit class="w-4 h-4" />
                            </button>
                            <button 
                                @click="toggleWalletStatus(row.id)"
                                :class="row.is_active 
                                    ? 'p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-orange-500 transition-colors' 
                                    : 'p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-green-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-green-500 transition-colors'"
                                :title="row.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'"
                            >
                                <icon-x-circle v-if="row.is_active" class="w-4 h-4" />
                                <icon-checks v-else class="w-4 h-4" />
                            </button>
                            <button 
                                @click="deleteWallet(row.id)"
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

        <!-- Modal for Add/Edit Wallet -->
        <div class="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto" :class="{ 'hidden': !showModal }">
            <div class="flex items-center justify-center min-h-screen px-4">
                <div class="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg my-8 text-black dark:text-white-dark">
                    <div class="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                        <h5 class="font-bold text-lg">{{ isEdit ? 'แก้ไขกระเป๋า' : 'เพิ่มกระเป๋าใหม่' }}</h5>
                        <button type="button" class="text-white-dark hover:text-dark" @click="closeModal">
                            <icon-x />
                        </button>
                    </div>
                    <div class="p-5">
                        <form @submit.prevent="saveWallet">
                            <div class="mb-5">
                                <label for="network">เครือข่าย *</label>
                                <select v-model="formData.network" id="network" class="form-select" required>
                                    <option value="">เลือกเครือข่าย</option>
                                    <option value="TRC20">TRC20 (Tron)</option>
                                    <option value="ERC20">ERC20 (Ethereum)</option>
                                    <option value="BEP20">BEP20 (BSC)</option>
                                </select>
                            </div>
                            <div class="mb-5">
                                <label for="wallet_name">ชื่อกระเป๋า *</label>
                                <input v-model="formData.wallet_name" id="wallet_name" type="text" class="form-input" placeholder="ชื่อกระเป๋า" required />
                            </div>
                            <div class="mb-5">
                                <label for="wallet_address">ที่อยู่กระเป๋า *</label>
                                <textarea v-model="formData.wallet_address" id="wallet_address" rows="3" class="form-textarea" placeholder="ที่อยู่กระเป๋า" required></textarea>
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

// Page meta
definePageMeta({
    title: 'จัดการข้อมูลกระเป๋า',
    middleware: 'admin-auth'
})

// Types
interface Wallet {
    id: number
    network: string
    wallet_address: string
    wallet_name: string
    is_active: boolean
    qr_code_url?: string | null
    created_at: string
    created_at_th: string
}

// Reactive data
const wallets = ref<Wallet[]>([])
const filteredWallets = ref<Wallet[]>([])
const search = ref('')
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const isEdit = ref(false)

// Form data
const formData = ref({
    id: null as number | null,
    network: '',
    wallet_name: '',
    wallet_address: '',
    is_active: true
})

// Computed properties
const activeWallets = computed(() => {
    return wallets.value.filter(w => w.is_active).length
})

const totalNetworks = computed(() => {
    const networks = new Set(wallets.value.map(w => w.network))
    return networks.size
})

// Table configuration
const columns = ref([
    { key: 'network', label: 'เครือข่าย' },
    { key: 'wallet_name', label: 'ชื่อกระเป๋า' },
    { key: 'wallet_address', label: 'ที่อยู่กระเป๋า' },
    { key: 'is_active', label: 'สถานะ' },
    { key: 'created_at_th', label: 'สร้างเมื่อ' },
    { key: 'actions', label: 'จัดการ' }
])

// Methods
const fetchWallets = async () => {
    loading.value = true
    try {
        const { data, error } = await supabase
            .from('store_wallets')
            .select('*')
            .order('created_at_th', { ascending: false })

        if (error) {
            console.error('Error fetching wallets:', error)
            alert('เกิดข้อผิดพลาดในการโหลดข้อมูลกระเป๋า')
            return
        }

        wallets.value = data || []
        filteredWallets.value = [...wallets.value]
    } catch (error) {
        console.error('Error fetching wallets:', error)
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลกระเป๋า')
    } finally {
        loading.value = false
    }
}

const filterWallets = () => {
    if (!search.value) {
        filteredWallets.value = [...wallets.value]
    } else {
        filteredWallets.value = wallets.value.filter(wallet =>
            wallet.network.toLowerCase().includes(search.value.toLowerCase()) ||
            wallet.wallet_name.toLowerCase().includes(search.value.toLowerCase()) ||
            wallet.wallet_address.toLowerCase().includes(search.value.toLowerCase())
        )
    }
}

const resetForm = () => {
    formData.value = {
        id: null,
        network: '',
        wallet_name: '',
        wallet_address: '',
        is_active: true
    }
}

const closeModal = () => {
    showModal.value = false
    isEdit.value = false
    resetForm()
}

const editWallet = (id: number) => {
    const wallet = wallets.value.find(w => w.id === id)
    if (wallet) {
        formData.value = { 
            id: wallet.id,
            network: wallet.network,
            wallet_name: wallet.wallet_name,
            wallet_address: wallet.wallet_address,
            is_active: wallet.is_active
        }
        isEdit.value = true
        showModal.value = true
    }
}

const saveWallet = async () => {
    saving.value = true
    try {
        if (isEdit.value) {
            // Update existing wallet
            const { data, error } = await supabase
                .from('store_wallets')
                .update({
                    network: formData.value.network,
                    wallet_name: formData.value.wallet_name,
                    wallet_address: formData.value.wallet_address,
                    is_active: formData.value.is_active
                })
                .eq('id', formData.value.id)
                .select()

            if (error) {
                console.error('Error updating wallet:', error)
                alert('เกิดข้อผิดพลาดในการแก้ไขกระเป๋า')
                return
            }

            // Update local data
            const index = wallets.value.findIndex(w => w.id === formData.value.id)
            if (index !== -1 && data && data[0]) {
                wallets.value[index] = data[0]
            }
            alert('แก้ไขกระเป๋าเรียบร้อยแล้ว')
        } else {
            // Create new wallet
            const { data, error } = await supabase
                .from('store_wallets')
                .insert({
                    network: formData.value.network,
                    wallet_name: formData.value.wallet_name,
                    wallet_address: formData.value.wallet_address,
                    is_active: formData.value.is_active
                })
                .select()

            if (error) {
                console.error('Error creating wallet:', error)
                alert('เกิดข้อผิดพลาดในการเพิ่มกระเป๋า')
                return
            }

            if (data && data[0]) {
                wallets.value.push(data[0])
            }
            alert('เพิ่มกระเป๋าเรียบร้อยแล้ว')
        }
        
        filterWallets()
        closeModal()
        
        // Sync network status after saving wallet
        await syncNetworkStatus(formData.value.network)
    } catch (error) {
        console.error('Error saving wallet:', error)
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
        saving.value = false
    }
}

const toggleWalletStatus = async (id: number) => {
    try {
        const wallet = wallets.value.find(w => w.id === id)
        if (wallet) {
            const newStatus = !wallet.is_active
            const networkToCheck = wallet.network
            
            const { error } = await supabase
                .from('store_wallets')
                .update({ is_active: newStatus })
                .eq('id', id)

            if (error) {
                console.error('Error toggling wallet status:', error)
                alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ')
                return
            }

            wallet.is_active = newStatus
            alert('เปลี่ยนสถานะกระเป๋าเรียบร้อยแล้ว')
            filterWallets()
            
            // Sync network status after changing wallet status
            await syncNetworkStatus(networkToCheck)
        }
    } catch (error) {
        console.error('Error toggling wallet status:', error)
        alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ')
    }
}

const syncNetworkStatus = async (network?: string) => {
    try {
        // Get all active wallets by network
        const { data: activeWalletsByNetwork, error: walletsError } = await supabase
            .from('store_wallets')
            .select('network')
            .eq('is_active', true)

        if (walletsError) {
            console.error('Error checking active wallets:', walletsError)
            return
        }

        // Get active networks from wallets
        const activeNetworks = new Set(activeWalletsByNetwork?.map(w => w.network) || [])

        // Update networks table - disable networks that have no active wallets
        const { error: networksError } = await supabase
            .from('networks')
            .update({ is_active: false })
            .not('id', 'in', `(${Array.from(activeNetworks).map(n => `'${n}'`).join(',') || "''"})`)

        if (networksError) {
            console.error('Error updating networks status:', networksError)
            return
        }

        // Enable networks that have active wallets
        if (activeNetworks.size > 0) {
            const { error: enableNetworksError } = await supabase
                .from('networks')
                .update({ is_active: true })
                .in('id', Array.from(activeNetworks))

            if (enableNetworksError) {
                console.error('Error enabling networks:', enableNetworksError)
            }
        }

    } catch (error) {
        console.error('Error syncing network status:', error)
    }
}

const deleteWallet = async (id: number) => {
    const confirmed = confirm('คุณแน่ใจหรือไม่ที่จะลบกระเป๋านี้?')

    if (confirmed) {
        try {
            const wallet = wallets.value.find(w => w.id === id)
            const networkToCheck = wallet?.network

            const { error } = await supabase
                .from('store_wallets')
                .delete()
                .eq('id', id)

            if (error) {
                console.error('Error deleting wallet:', error)
                alert('เกิดข้อผิดพลาดในการลบกระเป๋า')
                return
            }

            const index = wallets.value.findIndex(w => w.id === id)
            if (index !== -1) {
                wallets.value.splice(index, 1)
                alert('ลบกระเป๋าเรียบร้อยแล้ว')
                filterWallets()
                
                // Sync network status after deleting wallet
                await syncNetworkStatus(networkToCheck)
            }
        } catch (error) {
            console.error('Error deleting wallet:', error)
            alert('เกิดข้อผิดพลาดในการลบกระเป๋า')
        }
    }
}

// Global functions for DataTable actions - ไม่จำเป็นแล้ว
// if (process.client) {
//     (window as any).handleEdit = editWallet;
//     (window as any).handleToggleStatus = toggleWalletStatus;
//     (window as any).handleDelete = deleteWallet;
// }

// Watchers
watch(search, filterWallets)

// Lifecycle
onMounted(() => {
    fetchWallets()
    // Initial sync of network status
    syncNetworkStatus()
})
</script>
