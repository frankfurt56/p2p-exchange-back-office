<template>
    <div>
        <!-- Header Section -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-xl font-medium text-gray-800 dark:text-white">จัดการราคา USDT</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">กำหนดราคาซื้อขาย USDT สำหรับระบบ P2P Exchange</p>
            </div>
            <button 
                @click="openEditModal"
                class="btn px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center gap-2 transition-colors"
                :disabled="loading"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>แก้ไขราคา</span>
            </button>
        </div>

        <!-- Current Price Display -->
        <div v-if="!loading && currentPrice" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <!-- Buy Price Card -->
        <div class="panel border border-gray-200 dark:border-gray-700">
            <div class="flex items-center">
                <span class="bg-green-100 p-4 rounded-full mr-4 dark:bg-green-900/30">
                    <svg class="w-8 h-8 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                </span>
                <div class="flex-1">
                    <h3 class="text-sm text-gray-600 dark:text-gray-400 mb-1">ราคาซื้อ USDT</h3>
                    <p class="text-3xl font-bold text-green-600 dark:text-green-400">
                        ฿{{ formatCurrency(currentPrice.buy_price) }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        ราคาที่คุณขาย USDT ให้ลูกค้า
                    </p>
                </div>
            </div>
        </div>

        <!-- Sell Price Card -->
        <div class="panel border border-gray-200 dark:border-gray-700">
            <div class="flex items-center">
                <span class="bg-red-100 p-4 rounded-full mr-4 dark:bg-red-900/30">
                    <svg class="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                </span>
                <div class="flex-1">
                    <h3 class="text-sm text-gray-600 dark:text-gray-400 mb-1">ราคาขาย USDT</h3>
                    <p class="text-3xl font-bold text-red-600 dark:text-red-400">
                        ฿{{ formatCurrency(currentPrice.sell_price) }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        ราคาที่คุณรับซื้อ USDT จากลูกค้า
                    </p>
                </div>
            </div>
        </div>
        </div>

        <!-- Price Information Panel -->
        <div v-if="!loading && currentPrice" class="panel mb-6">
            <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-4">ข้อมูลการอัพเดท</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label class="text-sm text-gray-600 dark:text-gray-400 block mb-2">อัพเดทล่าสุด</label>
                    <p class="font-medium">{{ formatDate(currentPrice.updated_at_th) }}</p>
                </div>
                <div>
                    <label class="text-sm text-gray-600 dark:text-gray-400 block mb-2">ส่วนต่างราคา (Spread)</label>
                    <p class="font-medium text-orange-600 dark:text-orange-400">
                        ฿{{ formatCurrency(parseFloat(currentPrice.buy_price.toString()) - parseFloat(currentPrice.sell_price.toString())) }}
                    </p>
                </div>
                <div>
                    <label class="text-sm text-gray-600 dark:text-gray-400 block mb-2">เปอร์เซ็นต์กำไร</label>
                    <p class="font-medium text-orange-600 dark:text-orange-400">
                        {{ calculateProfitPercentage() }}%
                    </p>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center p-12">
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500"></div>
            <span class="ml-3 text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูลราคา...</span>
        </div>

        <!-- Error State -->
        <div v-if="error && !loading" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div class="flex items-start">
                <svg class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <div>
                    <h3 class="font-medium text-red-800 dark:text-red-200">เกิดข้อผิดพลาด</h3>
                    <p class="text-red-700 dark:text-red-300 text-sm mt-1">{{ error }}</p>
                </div>
            </div>
        </div>

        <!-- Edit Price Modal -->
        <div v-if="showEditModal" class="fixed inset-0 z-50 overflow-y-auto">
            <div class="flex items-center justify-center min-h-screen px-4">
                <div class="fixed inset-0 bg-black opacity-50" @click="closeEditModal"></div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md z-10">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-semibold">แก้ไขราคา USDT</h3>
                        <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <form @submit.prevent="handlePriceUpdate" class="space-y-4">
                        <!-- Buy Price -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                ราคาซื้อ USDT (บาท)
                            </label>
                            <input
                                v-model="formData.buy_price"
                                type="number"
                                step="0.01"
                                min="0"
                                class="form-input w-full"
                                placeholder="เช่น 32.00"
                                required
                            />
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                ราคาที่คุณขาย USDT ให้ลูกค้า (ต้องสูงกว่าราคาขาย)
                            </p>
                        </div>

                        <!-- Sell Price -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                ราคาขาย USDT (บาท)
                            </label>
                            <input
                                v-model="formData.sell_price"
                                type="number"
                                step="0.01"
                                min="0"
                                class="form-input w-full"
                                placeholder="เช่น 30.00"
                                required
                            />
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                ราคาที่คุณรับซื้อ USDT จากลูกค้า (ต้องต่ำกว่าราคาซื้อ)
                            </p>
                        </div>

                        <!-- Price Preview -->
                        <div v-if="formData.buy_price && formData.sell_price" class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ตัวอย่างการคำนวณ:</h4>
                            <div class="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                <p>• ส่วนต่างราคา: ฿{{ (parseFloat(formData.buy_price) - parseFloat(formData.sell_price)).toFixed(2) }}</p>
                                <p>• เปอร์เซ็นต์กำไร: {{ (((parseFloat(formData.buy_price) - parseFloat(formData.sell_price)) / parseFloat(formData.sell_price)) * 100).toFixed(2) }}%</p>
                                <div class="mt-2 text-xs">
                                    <p class="text-green-600 dark:text-green-400">📈 ลูกค้าซื้อ USDT: ฿{{ formData.buy_price }}</p>
                                    <p class="text-red-600 dark:text-red-400">📉 ลูกค้าขาย USDT: ฿{{ formData.sell_price }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button 
                                type="button" 
                                @click="closeEditModal" 
                                class="btn btn-outline-secondary"
                                :disabled="updating"
                            >
                                ยกเลิก
                            </button>
                            <button 
                                type="submit" 
                                class="btn btn-primary"
                                :disabled="updating"
                            >
                                <span v-if="updating" class="inline-flex items-center">
                                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    กำลังบันทึก...
                                </span>
                                <span v-else>บันทึกราคา</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminAPI, type UsdtPrice } from '~/lib/supabase'
import { formatDate } from '~/utils/dateFormatter'

// Page Meta
definePageMeta({
    middleware: 'admin-auth'
})

// SEO
useHead({
    title: 'จัดการราคา USDT | P2P Exchange Admin'
})

// State
const loading = ref(true)
const error = ref('')
const updating = ref(false)
const currentPrice = ref<UsdtPrice | null>(null)
const showEditModal = ref(false)

// Form Data
const formData = ref({
    buy_price: '',
    sell_price: ''
})

// Methods
const fetchCurrentPrice = async () => {
    try {
        loading.value = true
        error.value = ''
        
        const data = await adminAPI.getCurrentUsdtPrice()
        currentPrice.value = data
        
    } catch (err: any) {
        console.error('Error fetching USDT price:', err)
        error.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูลราคา: ' + (err.message || 'ไม่ทราบสาเหตุ')
    } finally {
        loading.value = false
    }
}

const openEditModal = () => {
    if (currentPrice.value) {
        formData.value = {
            buy_price: currentPrice.value.buy_price.toString(),
            sell_price: currentPrice.value.sell_price.toString()
        }
    }
    showEditModal.value = true
}

const closeEditModal = () => {
    showEditModal.value = false
    formData.value = {
        buy_price: '',
        sell_price: ''
    }
}

const handlePriceUpdate = async () => {
    try {
        updating.value = true
        
        const buyPrice = parseFloat(formData.value.buy_price)
        const sellPrice = parseFloat(formData.value.sell_price)
        
        // Basic validation
        if (buyPrice <= 0 || sellPrice <= 0) {
            alert('ราคาต้องมากกว่า 0')
            return
        }
        
        // ตรรกะใหม่: ราคาซื้อ (ที่คุณขายให้ลูกค้า) ต้องมากกว่าราคาขาย (ที่คุณรับซื้อจากลูกค้า)
        if (buyPrice <= sellPrice) {
            alert('ราคาซื้อ (ราคาที่คุณขาย USDT ให้ลูกค้า) ต้องมากกว่าราคาขาย (ราคาที่คุณรับซื้อ USDT จากลูกค้า)')
            return
        }
        
        const updatedPrice = await adminAPI.updateUsdtPrice(buyPrice, sellPrice)
        currentPrice.value = updatedPrice
        
        closeEditModal()
        alert('อัพเดทราคาเรียบร้อยแล้ว')
        
    } catch (err: any) {
        console.error('Error updating USDT price:', err)
        alert('เกิดข้อผิดพลาดในการอัพเดทราคา: ' + (err.message || 'ไม่ทราบสาเหตุ'))
    } finally {
        updating.value = false
    }
}

const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return num.toLocaleString('th-TH', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    })
}

const calculateProfitPercentage = () => {
    if (!currentPrice.value) return '0.00'
    
    const buyPrice = parseFloat(currentPrice.value.buy_price.toString())
    const sellPrice = parseFloat(currentPrice.value.sell_price.toString())
    const profit = ((buyPrice - sellPrice) / sellPrice) * 100
    
    return profit.toFixed(2)
}

// Lifecycle
onMounted(async () => {
    await fetchCurrentPrice()
})
</script>

<style scoped>
.btn {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    transition: colors 0.2s;
}

.btn:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.btn-primary {
    background-color: rgb(59, 130, 246);
    color: white;
}

.btn-primary:hover {
    background-color: rgb(37, 99, 235);
}

.btn-outline-secondary {
    border: 1px solid rgb(209, 213, 219);
    color: rgb(55, 65, 81);
}

.btn-outline-secondary:hover {
    background-color: rgb(249, 250, 251);
}

.dark .btn-outline-secondary {
    border-color: rgb(75, 85, 99);
    color: rgb(209, 213, 219);
}

.dark .btn-outline-secondary:hover {
    background-color: rgb(31, 41, 55);
}

.form-input {
    display: block;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid rgb(209, 213, 219);
    border-radius: 0.375rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.form-input:focus {
    outline: none;
    border-color: rgb(59, 130, 246);
    box-shadow: 0 0 0 1px rgb(59, 130, 246);
}

.dark .form-input {
    background-color: rgb(31, 41, 55);
    border-color: rgb(75, 85, 99);
    color: white;
}

.panel {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.dark .panel {
    background-color: rgb(17, 24, 39);
}
</style>
