<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-black dark:text-white">จัดการธุรกรรม</h1>
            
            <!-- Summary Stats -->
            <div class="flex items-center space-x-4">
                <div class="text-sm">
                    <span class="text-gray-500">ทั้งหมด:</span>
                    <span class="font-bold text-blue-600">{{ totalTransactions }}</span>
                </div>
                <div class="text-sm">
                    <span class="text-gray-500">รอดำเนินการ:</span>
                    <span class="font-bold text-orange-600">{{ pendingCount }}</span>
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div class="panel mb-6">
            <div class="flex flex-wrap items-center gap-4 mb-4">
                <!-- Search -->
                <div class="flex-1 min-w-64">
                    <input
                        v-model="searchTerm"
                        type="text"
                        placeholder="ค้นหาด้วย Order Reference หรือชื่อผู้ใช้..."
                        class="form-input"
                    />
                </div>

                <!-- Status Filter -->
                <CustomDropdown
                    v-model="statusFilter"
                    :options="statusOptions"
                    placeholder="ทุกสถานะ"
                    class="w-40"
                />

                <!-- Type Filter -->
                <CustomDropdown
                    v-model="typeFilter"
                    :options="typeOptions"
                    placeholder="ทุกประเภท"
                    class="w-32"
                />

                <!-- Date Range -->
                <input
                    v-model="dateFrom"
                    type="date"
                    class="form-input w-40"
                    placeholder="จากวันที่"
                />
                <input
                    v-model="dateTo"
                    type="date"
                    class="form-input w-40"
                    placeholder="ถึงวันที่"
                />

                <!-- Reset Filters -->
                <button
                    @click="resetFilters"
                    class="btn btn-outline-secondary"
                >
                    รีเซ็ต
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="panel">
            <div class="flex items-center justify-center py-10">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span class="ml-3">กำลังโหลดข้อมูล...</span>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="panel">
            <div class="text-center py-10 text-red-500">
                <p>{{ error }}</p>
                <button @click="fetchTransactions" class="btn btn-primary mt-4">
                    ลองใหม่
                </button>
            </div>
        </div>

        <!-- Transaction Table -->
        <div v-else class="panel">
            <div class="table-responsive">
                <table class="table-hover">
                    <thead>
                        <tr>
                            <th class="text-center w-32">Order Ref</th>
                            <th class="w-24">ประเภท</th>
                            <th class="w-32">ผู้ใช้</th>
                            <th class="w-36">จำนวนเงิน</th>
                            <th class="w-32">เครือข่าย</th>
                            <th class="w-24 text-center">สถานะ</th>
                            <th class="w-32">วันที่สร้าง</th>
                            <th class="w-24 text-center">ไฟล์</th>
                            <th class="w-32 text-center">การกระทำ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="filteredTransactions.length === 0">
                            <td colspan="9" class="text-center py-8 text-gray-500">
                                ไม่พบข้อมูลธุรกรรม
                            </td>
                        </tr>
                        <tr v-for="transaction in filteredTransactions" :key="transaction.id" 
                            class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            
                            <!-- Order Reference -->
                            <td class="text-center">
                                <div class="font-mono text-sm font-medium text-primary">
                                    {{ transaction.order_reference }}
                                </div>
                                <div class="text-xs text-gray-500 mt-1">
                                    {{ formatShortId(transaction.id) }}
                                </div>
                            </td>

                            <!-- Transaction Type -->
                            <td>
                                <span 
                                    :class="{
                                        'badge-outline-success': transaction.transaction_type === 'buy',
                                        'badge-outline-primary': transaction.transaction_type === 'sell'
                                    }"
                                    class="badge"
                                >
                                    {{ transaction.transaction_type === 'buy' ? 'ซื้อ' : 'ขาย' }}
                                </span>
                            </td>

                            <!-- User -->
                            <td>
                                <div class="font-medium">{{ transaction.user_name || 'ไม่ระบุ' }}</div>
                                <div class="text-xs text-gray-500">{{ formatShortId(transaction.user_id) }}</div>
                            </td>

                            <!-- Amount -->
                            <td>
                                <div class="font-medium">
                                    {{ formatCurrency(transaction.from_amount) }} {{ transaction.from_currency }}
                                </div>
                                <div class="text-sm text-gray-500">
                                    → {{ formatCurrency(transaction.to_amount) }} {{ transaction.to_currency }}
                                </div>
                                <div class="text-xs text-gray-400">
                                    Rate: {{ formatCurrency(transaction.exchange_rate) }}
                                </div>
                            </td>

                            <!-- Network -->
                            <td>
                                <span class="badge badge-outline-dark">
                                    {{ transaction.selected_network }}
                                </span>
                            </td>

                            <!-- Status -->
                            <td class="text-center">
                                <span 
                                    :class="{
                                        'badge-outline-warning': transaction.status === 'pending',
                                        'badge-outline-info': transaction.status === 'processing', 
                                        'badge-outline-success': transaction.status === 'completed',
                                        'badge-outline-danger': transaction.status === 'cancelled'
                                    }"
                                    class="badge"
                                >
                                    {{ getStatusText(transaction.status) }}
                                </span>
                            </td>

                            <!-- Created Date -->
                            <td>
                                <div class="text-sm">
                                    {{ formatDateTime(transaction.created_at_th || transaction.created_at) }}
                                </div>
                            </td>

                            <!-- Files -->
                            <td class="text-center">
                                <div class="flex items-center justify-center space-x-2">
                                    <!-- Payment Slip -->
                                    <button
                                        v-if="transaction.payment_slip_url"
                                        @click="viewImage(transaction.payment_slip_url, 'สลิปการชำระเงิน')"
                                        class="text-blue-500 hover:text-blue-600"
                                        title="ดูสลิปการชำระ"
                                    >
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                        </svg>
                                    </button>

                                    <!-- TXID Screenshot -->
                                    <button
                                        v-if="transaction.txid_screenshot_url"
                                        @click="viewImage(transaction.txid_screenshot_url, 'TXID Screenshot')"
                                        class="text-green-500 hover:text-green-600"
                                        title="ดู TXID Screenshot"
                                    >
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm8 6a2 2 0 11-4 0 2 2 0 014 0zm-2 4a4 4 0 00-3.464 2H16a1 1 0 001-1.53A4 4 0 0012 13z" />
                                        </svg>
                                    </button>

                                    <!-- No files indicator -->
                                    <span v-if="!transaction.payment_slip_url && !transaction.txid_screenshot_url" 
                                          class="text-gray-400 text-xs">-</span>
                                </div>
                            </td>

                            <!-- Actions -->
                            <td class="text-center">
                                <div class="flex items-center justify-center space-x-1">
                                    <!-- View Details -->
                                    <button
                                        @click="viewTransactionDetails(transaction)"
                                        class="text-primary hover:text-primary-dark p-1 rounded"
                                        title="ดูรายละเอียด"
                                    >
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>

                                    <!-- Update Status -->
                                    <button
                                        v-if="canUpdateStatus(transaction.status)"
                                        @click="showStatusModal(transaction)"
                                        class="text-orange-500 hover:text-orange-600 p-1 rounded"
                                        title="อัพเดทสถานะ"
                                    >
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="filteredTransactions.length > 0" class="flex items-center justify-between mt-6">
                <div class="text-sm text-gray-500">
                    แสดง {{ filteredTransactions.length }} จาก {{ totalTransactions }} รายการ
                </div>
                <div class="flex items-center space-x-2">
                    <!-- Simple pagination for now -->
                    <button class="btn btn-outline-secondary btn-sm" disabled>
                        ก่อนหน้า
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" disabled>
                        ถัดไป
                    </button>
                </div>
            </div>
        </div>

        <!-- Transaction Details Modal -->
        <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between p-6 border-b">
                    <h3 class="text-lg font-semibold">รายละเอียดธุรกรรม</h3>
                    <button
                        @click="closeDetailsModal"
                        class="text-gray-400 hover:text-gray-600 text-xl"
                    >
                        ×
                    </button>
                </div>

                <div v-if="selectedTransaction" class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Basic Info -->
                        <div class="space-y-4">
                            <h4 class="font-semibold text-gray-900 dark:text-white">ข้อมูลพื้นฐาน</h4>
                            
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span class="text-gray-500">Order Reference:</span>
                                    <div class="font-mono font-medium">{{ selectedTransaction.order_reference }}</div>
                                </div>
                                <div>
                                    <span class="text-gray-500">ประเภท:</span>
                                    <div>{{ selectedTransaction.transaction_type === 'buy' ? 'ซื้อ USDT' : 'ขาย USDT' }}</div>
                                </div>
                                <div>
                                    <span class="text-gray-500">ผู้ใช้:</span>
                                    <div>{{ selectedTransaction.user_name || 'ไม่ระบุ' }}</div>
                                </div>
                                <div>
                                    <span class="text-gray-500">เครือข่าย:</span>
                                    <div>{{ selectedTransaction.selected_network }}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Amount Info -->
                        <div class="space-y-4">
                            <h4 class="font-semibold text-gray-900 dark:text-white">จำนวนเงิน</h4>
                            
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span class="text-gray-500">จำนวน {{ selectedTransaction.from_currency }}:</span>
                                    <div class="font-medium">{{ formatCurrency(selectedTransaction.from_amount) }}</div>
                                </div>
                                <div>
                                    <span class="text-gray-500">จำนวน {{ selectedTransaction.to_currency }}:</span>
                                    <div class="font-medium">{{ formatCurrency(selectedTransaction.to_amount) }}</div>
                                </div>
                                <div class="col-span-2">
                                    <span class="text-gray-500">อัตราแลกเปลี่ยน:</span>
                                    <div class="font-medium">{{ formatCurrency(selectedTransaction.exchange_rate) }}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Wallet Info -->
                        <div class="space-y-4">
                            <h4 class="font-semibold text-gray-900 dark:text-white">ข้อมูล Wallet</h4>
                            
                            <div class="text-sm space-y-2">
                                <div>
                                    <span class="text-gray-500">Wallet Address (ปลายทาง):</span>
                                    <div class="font-mono text-xs break-all bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                        {{ selectedTransaction.recipient_wallet_address }}
                                    </div>
                                </div>
                                <div v-if="selectedTransaction.usdt_from_wallet_address">
                                    <span class="text-gray-500">USDT From Wallet:</span>
                                    <div class="font-mono text-xs break-all bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                        {{ selectedTransaction.usdt_from_wallet_address }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Bank Info -->
                        <div v-if="selectedTransaction.customer_bank_code" class="space-y-4">
                            <h4 class="font-semibold text-gray-900 dark:text-white">ข้อมูลธนาคาร</h4>
                            
                            <div class="grid grid-cols-1 gap-2 text-sm">
                                <div>
                                    <span class="text-gray-500">รหัสธนาคาร:</span>
                                    <div>{{ selectedTransaction.customer_bank_code }}</div>
                                </div>
                                <div>
                                    <span class="text-gray-500">เลขที่บัญชี:</span>
                                    <div>{{ selectedTransaction.customer_account_number }}</div>
                                </div>
                                <div>
                                    <span class="text-gray-500">ชื่อบัญชี:</span>
                                    <div>{{ selectedTransaction.customer_account_name }}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Files -->
                        <div class="col-span-1 md:col-span-2 space-y-4">
                            <h4 class="font-semibold text-gray-900 dark:text-white">ไฟล์แนบ</h4>
                            
                            <div class="flex flex-wrap gap-4">
                                <div v-if="selectedTransaction.payment_slip_url" class="text-center">
                                    <img
                                        :src="selectedTransaction.payment_slip_url"
                                        alt="Payment Slip"
                                        class="w-32 h-40 object-cover border rounded cursor-pointer hover:opacity-75"
                                        @click="viewImage(selectedTransaction.payment_slip_url, 'สลิปการชำระเงิน')"
                                    />
                                    <div class="text-xs text-gray-500 mt-1">สลิปการชำระ</div>
                                </div>
                                
                                <div v-if="selectedTransaction.txid_screenshot_url" class="text-center">
                                    <img
                                        :src="selectedTransaction.txid_screenshot_url"
                                        alt="TXID Screenshot"
                                        class="w-32 h-40 object-cover border rounded cursor-pointer hover:opacity-75"
                                        @click="viewImage(selectedTransaction.txid_screenshot_url, 'TXID Screenshot')"
                                    />
                                    <div class="text-xs text-gray-500 mt-1">TXID Screenshot</div>
                                </div>
                            </div>
                        </div>

                        <!-- Admin Notes -->
                        <div class="col-span-1 md:col-span-2 space-y-4">
                            <h4 class="font-semibold text-gray-900 dark:text-white">หมายเหตุของแอดมิน</h4>
                            
                            <div class="text-sm">
                                <div v-if="selectedTransaction.admin_notes" class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                                    {{ selectedTransaction.admin_notes }}
                                </div>
                                <div v-else class="text-gray-500 italic">
                                    ไม่มีหมายเหตุ
                                </div>
                            </div>
                        </div>

                        <!-- Timestamps -->
                        <div class="col-span-1 md:col-span-2 space-y-4">
                            <h4 class="font-semibold text-gray-900 dark:text-white">ข้อมูลเวลา</h4>
                            
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span class="text-gray-500">วันที่สร้าง:</span>
                                    <div>{{ formatDateTime(selectedTransaction.created_at_th || selectedTransaction.created_at) }}</div>
                                </div>
                                <div>
                                    <span class="text-gray-500">วันที่อัพเดท:</span>
                                    <div>{{ formatDateTime(selectedTransaction.updated_at_th || selectedTransaction.updated_at) }}</div>
                                </div>
                                <div v-if="selectedTransaction.admin_reviewed_at">
                                    <span class="text-gray-500">วันที่รีวิว:</span>
                                    <div>{{ formatDateTime(selectedTransaction.admin_reviewed_at) }}</div>
                                </div>
                                <div v-if="selectedTransaction.usdt_transferred_at">
                                    <span class="text-gray-500">วันที่โอน USDT:</span>
                                    <div>{{ formatDateTime(selectedTransaction.usdt_transferred_at) }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-end space-x-3 p-6 border-t">
                    <button
                        v-if="selectedTransaction && canUpdateStatus(selectedTransaction.status)"
                        @click="showStatusModal(selectedTransaction)"
                        class="btn btn-primary"
                    >
                        อัพเดทสถานะ
                    </button>
                    <button
                        @click="closeDetailsModal"
                        class="btn btn-outline-secondary"
                    >
                        ปิด
                    </button>
                </div>
            </div>
        </div>

        <!-- Update Status Modal -->
        <div v-if="showUpdateStatusModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                <div class="flex items-center justify-between p-6 border-b">
                    <h3 class="text-lg font-semibold">อัพเดทสถานะธุรกรรม</h3>
                    <button
                        @click="closeStatusModal"
                        class="text-gray-400 hover:text-gray-600 text-xl"
                    >
                        ×
                    </button>
                </div>

                <div class="p-6">
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-2">สถานะใหม่</label>
                        <CustomDropdown
                            v-model="newStatus"
                            :options="getAvailableStatuses(selectedTransaction?.status)"
                            placeholder="เลือกสถานะใหม่"
                        />
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-2">หมายเหตุ (ไม่บังคับ)</label>
                        <textarea
                            v-model="adminNotes"
                            rows="3"
                            class="form-textarea"
                            placeholder="เพิ่มหมายเหตุการเปลี่ยนแปลงสถานะ..."
                        ></textarea>
                    </div>
                </div>

                <div class="flex items-center justify-end space-x-3 p-6 border-t">
                    <button
                        @click="updateTransactionStatus"
                        :disabled="!newStatus || updatingStatus"
                        class="btn btn-primary"
                        :class="{ 'opacity-50 cursor-not-allowed': !newStatus || updatingStatus }"
                    >
                        <span v-if="updatingStatus">กำลังอัพเดท...</span>
                        <span v-else>อัพเดทสถานะ</span>
                    </button>
                    <button
                        @click="closeStatusModal"
                        :disabled="updatingStatus"
                        class="btn btn-outline-secondary"
                    >
                        ยกเลิก
                    </button>
                </div>
            </div>
        </div>

        <!-- Image Viewer Modal -->
        <div v-if="showImageModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div class="flex items-center justify-between p-4 border-b">
                    <h3 class="text-lg font-semibold">{{ imageModalTitle }}</h3>
                    <button
                        @click="closeImageModal"
                        class="text-gray-400 hover:text-gray-600 text-xl"
                    >
                        ×
                    </button>
                </div>
                <div class="p-4 text-center">
                    <img
                        :src="imageModalUrl"
                        :alt="imageModalTitle"
                        class="max-w-full max-h-[70vh] mx-auto rounded"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { supabase } from '~/lib/supabase'
import CustomDropdown from '~/components/CustomDropdown.vue'

// Page Meta
definePageMeta({
    middleware: 'admin-auth'
})

// SEO
useHead({
    title: 'จัดการธุรกรรม | P2P Exchange Admin'
})

// Types
interface Transaction {
    id: string
    user_id: string
    user_name: string
    order_reference: string
    transaction_type: 'buy' | 'sell'
    from_currency: string
    to_currency: string
    from_amount: number
    to_amount: number
    exchange_rate: number
    selected_network: string
    recipient_wallet_address: string
    payment_slip_url?: string
    txid_screenshot_url?: string
    customer_bank_code?: string
    customer_account_number?: string
    customer_account_name?: string
    usdt_from_wallet_address?: string
    usdt_transfer_hash?: string
    status: 'pending' | 'processing' | 'completed' | 'cancelled'
    admin_notes?: string
    admin_reviewed_by?: string
    admin_reviewed_at?: string
    usdt_transferred_at?: string
    created_at: string
    updated_at: string
    created_at_th?: string
    updated_at_th?: string
    submitted_at?: string
    submitted_at_th?: string
}

// State
const loading = ref(true)
const error = ref('')
const transactions = ref<Transaction[]>([])

// Filter State
const searchTerm = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')

// Modal State
const showDetailsModal = ref(false)
const selectedTransaction = ref<Transaction | null>(null)
const showUpdateStatusModal = ref(false)
const newStatus = ref('')
const adminNotes = ref('')
const updatingStatus = ref(false)

// Image Modal State
const showImageModal = ref(false)
const imageModalUrl = ref('')
const imageModalTitle = ref('')

// Filter Options
const statusOptions = [
    { value: '', label: 'ทุกสถานะ' },
    { value: 'pending', label: 'รอดำเนินการ' },
    { value: 'processing', label: 'กำลังดำเนินการ' },
    { value: 'completed', label: 'เสร็จสิ้น' },
    { value: 'cancelled', label: 'ยกเลิก' }
]

const typeOptions = [
    { value: '', label: 'ทุกประเภท' },
    { value: 'buy', label: 'ซื้อ USDT' },
    { value: 'sell', label: 'ขาย USDT' }
]

// Computed
const filteredTransactions = computed(() => {
    let filtered = transactions.value

    // Search filter
    if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase()
        filtered = filtered.filter(t => 
            t.order_reference?.toLowerCase().includes(term) ||
            t.user_name?.toLowerCase().includes(term)
        )
    }

    // Status filter
    if (statusFilter.value) {
        filtered = filtered.filter(t => t.status === statusFilter.value)
    }

    // Type filter  
    if (typeFilter.value) {
        filtered = filtered.filter(t => t.transaction_type === typeFilter.value)
    }

    // Date range filter
    if (dateFrom.value) {
        filtered = filtered.filter(t => {
            const transactionDate = new Date(t.created_at_th || t.created_at).toISOString().split('T')[0]
            return transactionDate >= dateFrom.value
        })
    }

    if (dateTo.value) {
        filtered = filtered.filter(t => {
            const transactionDate = new Date(t.created_at_th || t.created_at).toISOString().split('T')[0]
            return transactionDate <= dateTo.value
        })
    }

    return filtered
})

const totalTransactions = computed(() => transactions.value.length)
const pendingCount = computed(() => 
    transactions.value.filter(t => t.status === 'pending' || t.status === 'processing').length
)

// Methods
const fetchTransactions = async () => {
    try {
        loading.value = true
        error.value = ''

        const { data, error: fetchError } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false })

        if (fetchError) {
            console.error('Error fetching transactions:', fetchError)
            error.value = 'เกิดข้อผิดพลาดในการดึงข้อมูลธุรกรรม'
            return
        }

        transactions.value = data || []

    } catch (err) {
        console.error('Error:', err)
        error.value = 'เกิดข้อผิดพลาดที่ไม่คาดคิด'
    } finally {
        loading.value = false
    }
}

const resetFilters = () => {
    searchTerm.value = ''
    statusFilter.value = ''
    typeFilter.value = ''
    dateFrom.value = ''
    dateTo.value = ''
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 8
    }).format(amount)
}

const formatDateTime = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const formatShortId = (id: string) => {
    return id ? id.substring(0, 8) + '...' : ''
}

const getStatusText = (status: string) => {
    const statusMap = {
        'pending': 'รอดำเนินการ',
        'processing': 'กำลังดำเนินการ', 
        'completed': 'เสร็จสิ้น',
        'cancelled': 'ยกเลิก'
    }
    return statusMap[status as keyof typeof statusMap] || status
}

const canUpdateStatus = (currentStatus: string) => {
    return currentStatus !== 'completed' && currentStatus !== 'cancelled'
}

const getAvailableStatuses = (currentStatus?: string) => {
    const baseStatuses = [
        { value: 'pending', label: 'รอดำเนินการ' },
        { value: 'processing', label: 'กำลังดำเนินการ' },
        { value: 'completed', label: 'เสร็จสิ้น' },
        { value: 'cancelled', label: 'ยกเลิก' }
    ]
    
    // Filter out current status
    return baseStatuses.filter(s => s.value !== currentStatus)
}

const viewTransactionDetails = (transaction: Transaction) => {
    selectedTransaction.value = transaction
    showDetailsModal.value = true
}

const closeDetailsModal = () => {
    showDetailsModal.value = false
    selectedTransaction.value = null
}

const showStatusModal = (transaction: Transaction) => {
    selectedTransaction.value = transaction
    newStatus.value = ''
    adminNotes.value = transaction.admin_notes || ''
    showUpdateStatusModal.value = true
}

const closeStatusModal = () => {
    showUpdateStatusModal.value = false
    selectedTransaction.value = null
    newStatus.value = ''
    adminNotes.value = ''
}

const updateTransactionStatus = async () => {
    if (!selectedTransaction.value || !newStatus.value) return

    try {
        updatingStatus.value = true

        const { error: updateError } = await supabase
            .from('transactions')
            .update({
                status: newStatus.value,
                admin_notes: adminNotes.value || null,
                admin_reviewed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', selectedTransaction.value.id)

        if (updateError) {
            console.error('Error updating status:', updateError)
            alert('เกิดข้อผิดพลาดในการอัพเดทสถานะ')
            return
        }

        // Update local data
        const index = transactions.value.findIndex(t => t.id === selectedTransaction.value!.id)
        if (index !== -1) {
            transactions.value[index].status = newStatus.value as any
            transactions.value[index].admin_notes = adminNotes.value
        }

        alert('อัพเดทสถานะเรียบร้อยแล้ว')
        closeStatusModal()
        
        // Close details modal if open
        if (showDetailsModal.value) {
            closeDetailsModal()
        }

    } catch (err) {
        console.error('Error:', err)
        alert('เกิดข้อผิดพลาดที่ไม่คาดคิด')
    } finally {
        updatingStatus.value = false
    }
}

const viewImage = (url: string, title: string) => {
    imageModalUrl.value = url
    imageModalTitle.value = title
    showImageModal.value = true
}

const closeImageModal = () => {
    showImageModal.value = false
    imageModalUrl.value = ''
    imageModalTitle.value = ''
}

// Lifecycle
onMounted(() => {
    fetchTransactions()
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
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
}

.badge-outline-success {
    color: rgb(34 197 94);
    background-color: rgb(34 197 94 / 0.1);
    border: 1px solid rgb(34 197 94 / 0.2);
}

.badge-outline-primary {
    color: rgb(59 130 246);
    background-color: rgb(59 130 246 / 0.1);
    border: 1px solid rgb(59 130 246 / 0.2);
}

.badge-outline-warning {
    color: rgb(245 158 11);
    background-color: rgb(245 158 11 / 0.1);
    border: 1px solid rgb(245 158 11 / 0.2);
}

.badge-outline-info {
    color: rgb(14 165 233);
    background-color: rgb(14 165 233 / 0.1);
    border: 1px solid rgb(14 165 233 / 0.2);
}

.badge-outline-danger {
    color: rgb(239 68 68);
    background-color: rgb(239 68 68 / 0.1);
    border: 1px solid rgb(239 68 68 / 0.2);
}

.badge-outline-dark {
    color: rgb(75 85 99);
    background-color: rgb(75 85 99 / 0.1);
    border: 1px solid rgb(75 85 99 / 0.2);
}
</style>
