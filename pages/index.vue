<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-black dark:text-white">P2P Exchange Admin Dashboard</h1>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
            <!-- Total Transactions -->
            <div class="panel bg-gradient-to-r from-blue-500 to-blue-400 text-white">
                <div class="flex justify-between items-center">
                    <div class="ltr:mr-1 rtl:ml-1 text-md font-semibold">ธุรกรรมทั้งหมด</div>
                    <div class="p-3 rounded-full bg-white/20">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    </div>
                </div>
                <div class="flex items-center mt-5">
                    <div class="text-3xl font-bold ltr:mr-3 rtl:ml-3">{{ dashboardData.totalTransactions || 0 }}</div>
                </div>
                <div class="text-white/80 text-sm mt-1">รายการทั้งหมด</div>
            </div>

            <!-- Total Users -->
            <div class="panel bg-gradient-to-r from-purple-500 to-purple-400 text-white">
                <div class="flex justify-between items-center">
                    <div class="ltr:mr-1 rtl:ml-1 text-md font-semibold">ผู้ใช้ทั้งหมด</div>
                    <div class="p-3 rounded-full bg-white/20">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>
                <div class="flex items-center mt-5">
                    <div class="text-3xl font-bold ltr:mr-3 rtl:ml-3">{{ dashboardData.totalUsers || 0 }}</div>
                </div>
                <div class="text-white/80 text-sm mt-1">สมาชิกในระบบ</div>
            </div>

            <!-- Pending Transactions -->
            <div class="panel bg-gradient-to-r from-orange-500 to-orange-400 text-white">
                <div class="flex justify-between items-center">
                    <div class="ltr:mr-1 rtl:ml-1 text-md font-semibold">รอดำเนินการ</div>
                    <div class="p-3 rounded-full bg-white/20">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <div class="flex items-center mt-5">
                    <div class="text-3xl font-bold ltr:mr-3 rtl:ml-3">{{ dashboardData.pending || 0 }}</div>
                </div>
                <div class="text-white/80 text-sm mt-1">ต้องตรวจสอบ</div>
            </div>

            <!-- Completed Transactions -->
            <div class="panel bg-gradient-to-r from-green-500 to-green-400 text-white">
                <div class="flex justify-between items-center">
                    <div class="ltr:mr-1 rtl:ml-1 text-md font-semibold">สำเร็จแล้ว</div>
                    <div class="p-3 rounded-full bg-white/20">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <div class="flex items-center mt-5">
                    <div class="text-3xl font-bold ltr:mr-3 rtl:ml-3">{{ dashboardData.completed || 0 }}</div>
                </div>
                <div class="text-white/80 text-sm mt-1">เสร็จสมบูรณ์</div>
            </div>
        </div>

        <!-- Additional Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <!-- Processing Transactions -->
            <div class="panel bg-gradient-to-r from-indigo-500 to-indigo-400 text-white">
                <div class="flex justify-between items-center">
                    <div class="ltr:mr-1 rtl:ml-1 text-md font-semibold">กำลังดำเนินการ</div>
                    <div class="p-3 rounded-full bg-white/20">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </div>
                </div>
                <div class="flex items-center mt-5">
                    <div class="text-3xl font-bold ltr:mr-3 rtl:ml-3">{{ dashboardData.processing || 0 }}</div>
                </div>
                <div class="text-white/80 text-sm mt-1">อยู่ระหว่างการทำรายการ</div>
            </div>

            <!-- Cancelled Transactions -->
            <div class="panel bg-gradient-to-r from-red-500 to-red-400 text-white">
                <div class="flex justify-between items-center">
                    <div class="ltr:mr-1 rtl:ml-1 text-md font-semibold">ยกเลิกแล้ว</div>
                    <div class="p-3 rounded-full bg-white/20">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <div class="flex items-center mt-5">
                    <div class="text-3xl font-bold ltr:mr-3 rtl:ml-3">{{ dashboardData.cancelled || 0 }}</div>
                </div>
                <div class="text-white/80 text-sm mt-1">รายการที่ไม่สำเร็จ</div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <NuxtLink to="/transactions" class="panel hover:shadow-lg transition-shadow cursor-pointer">
                <div class="flex items-center justify-between mb-5">
                    <h5 class="font-semibold text-lg dark:text-white-light">จัดการธุรกรรม</h5>
                    <div class="text-primary">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path opacity="0.5" d="M12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22Z" fill="currentColor"/>
                            <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                <p class="text-white-dark">ตรวจสอบ อนุมัติ และจัดการธุรกรรมทั้งหมด</p>
            </NuxtLink>

            <NuxtLink to="/users" class="panel hover:shadow-lg transition-shadow cursor-pointer">
                <div class="flex items-center justify-between mb-5">
                    <h5 class="font-semibold text-lg dark:text-white-light">จัดการผู้ใช้</h5>
                    <div class="text-secondary">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="9" cy="6" r="4" stroke="currentColor" stroke-width="1.5" />
                            <ellipse cx="9" cy="17" rx="7" ry="4" stroke="currentColor" stroke-width="1.5" />
                        </svg>
                    </div>
                </div>
                <p class="text-white-dark">ดูรายชื่อ เปิด/ปิด และจัดการบัญชีผู้ใช้</p>
            </NuxtLink>

            <NuxtLink to="/usdt-price" class="panel hover:shadow-lg transition-shadow cursor-pointer">
                <div class="flex items-center justify-between mb-5">
                    <h5 class="font-semibold text-lg dark:text-white-light">การตั้งค่า</h5>
                    <div class="text-success">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" />
                            <path opacity="0.5" d="M13.7654 2.15224C13.3978 2 12.9319 2 12 2C11.0681 2 10.6022 2 10.2346 2.15224C9.85785 2.30448 9.57639 2.58594 9.01348 3.14885L8.5 3.66272C8.22386 3.93886 7.89052 4.15224 7.51836 4.27777C7.146 4.40355 6.74226 4.43869 6.33608 4.37916L5.75 4.30312C5.05808 4.20016 4.71212 4.14868 4.37059 4.2218C4.02906 4.29492 3.7354 4.48225 3.14808 4.85691C2.56076 5.23157 2.26710 5.41890 2.04435 5.67422C1.8216 5.92954 1.69433 6.23653 1.43982 6.85051L1.1 7.65963C0.81233 8.36775 0.668497 8.72181 0.668497 9.12058C0.668497 9.51935 0.81233 9.87341 1.1 10.5815L1.43982 11.3906C1.69433 12.0046 1.8216 12.3116 2.04435 12.5669C2.26710 12.8222 2.56076 13.0096 3.14808 13.3842L3.75 13.7969C4.34695 14.1716 4.64543 14.3589 4.85235 14.6142C5.05926 14.8695 5.16426 15.1765 5.37425 15.7906L5.75 16.7969C6.0377 17.505 6.18154 17.8591 6.33608 18.1316C6.49062 18.404 6.75614 18.5789 7.28719 18.9285C7.81823 19.2782 8.08375 19.4531 8.35235 19.5262C8.62095 19.5993 8.89729 19.5635 9.45 19.4918L10.0361 19.4156C10.4423 19.3561 10.846 19.3912 11.2184 19.517C11.5908 19.6428 11.9241 19.8562 12.2 20.132L12.7654 20.6459C13.3978 21.1441 13.7093 21.3931 14.0346 21.4853C14.3599 21.5775 14.7069 21.5014 15.4008 21.3491L16.25 21.1685C16.8462 21.0431 17.2023 20.9804 17.5535 20.8547C17.9047 20.7291 18.2184 20.5484 18.8461 20.187L19.5 19.8142C20.0377 19.5046 20.3065 19.3497 20.5346 19.1316C20.7627 18.9135 20.9346 18.6465 21.2785 18.1124L21.6 17.3906C21.9877 16.6825 22.1815 16.3284 22.1815 15.9296C22.1815 15.5309 21.9877 15.1768 21.6 14.4687L21.2785 13.7906C21.0239 13.0765 20.8966 12.7695 20.6739 12.5142C20.4511 12.2589 20.1575 12.0716 19.5708 11.6969L19 11.3142C18.4031 10.9395 18.1046 10.7522 17.8977 10.4969C17.6908 10.2416 17.5858 9.93458 17.3758 9.32058L17 8.31428C16.7123 7.60616 16.5685 7.2521 16.4139 6.97967C16.2594 6.70724 15.9939 6.53237 15.4628 6.18263C14.9318 5.83289 14.6663 5.65802 14.3977 5.58491C14.1291 5.5118 13.8527 5.54764 13.3 5.61928L12.7139 5.69532C12.3077 5.75486 11.904 5.71972 11.5316 5.59394C11.1592 5.46816 10.8259 5.25478 10.55 4.97864L10.0346 4.53477C9.85785 4.48224 9.65728 4.42994 9.45 4.37916" stroke="currentColor" stroke-width="1.5" />
                        </svg>
                    </div>
                </div>
                <p class="text-white-dark">จัดการราคา USDT และการตั้งค่าระบบ</p>
            </NuxtLink>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="panel">
            <div class="flex items-center justify-center p-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span class="ml-2">กำลังโหลดข้อมูล...</span>
            </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="panel border-l-4 border-danger">
            <div class="text-danger">
                <p><strong>เกิดข้อผิดพลาด:</strong> {{ error }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAdminAuthStore } from '~/stores/adminAuth'
import { adminAPI } from '~/lib/supabase'

// Page Meta
definePageMeta({
  middleware: 'admin-auth'
})

// SEO
useHead({
  title: 'Dashboard | P2P Exchange Admin'
})

// Stores
const authStore = useAdminAuthStore()

// State
const mounted = ref(false)
const loading = ref(true)
const error = ref('')
const dashboardData = ref({
  totalTransactions: 0,
  totalUsers: 0,
  pending: 0,
  processing: 0,
  completed: 0,
  cancelled: 0,
  totalVolume: 0
})

// Methods
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const loadDashboardData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const data = await adminAPI.getDashboardStats()
    dashboardData.value = { ...dashboardData.value, ...data }
  } catch (err: any) {
    error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
    console.error('Dashboard data error:', err)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // Set mounted flag สำหรับป้องกัน hydration mismatch
  mounted.value = true
  
  // Authentication จะถูกจัดการใน middleware แล้ว
  if (authStore.isAuthenticated) {
    await loadDashboardData()
  }
})
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.15s ease;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-outline-danger {
  color: #e7515a;
  border-color: #e7515a;
  background-color: transparent;
}

.btn-outline-danger:hover {
  background-color: #e7515a;
  color: white;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.text-primary {
  color: #4361ee;
}

.text-secondary {
  color: #805dca;
}

.text-success {
  color: #00ab55;
}

.text-danger {
  color: #e7515a;
}

.text-white-dark {
  color: #506690;
}
</style>
