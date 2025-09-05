<template>
    <div class="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
        <!-- <img
            class="absolute left-0 top-0 h-full w-full object-cover"
            src="/assets/images/auth-bg.jpg"
            alt=""
        /> -->
        
        <div class="relative w-full max-w-[870px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
            <div class="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-6 lg:min-h-[758px] py-20">
                <div class="mx-auto w-full max-w-[440px]">
                    <div class="mb-10">
                        <h1 class="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">
                            Admin Panel
                        </h1>
                        <p class="text-base font-bold leading-normal text-white-dark">
                            เข้าสู่ระบบจัดการ P2P Exchange
                        </p>
                    </div>

                    <form @submit.prevent="handleLogin" class="space-y-5 dark:text-white">
                        <!-- Username Field -->
                        <div>
                            <label for="username" class="dark:text-white mb-2 block">ชื่อผู้ใช้</label>
                            <div class="relative text-white-dark">
                                <input
                                    id="username"
                                    v-model="form.username"
                                    type="text"
                                    placeholder="กรอกชื่อผู้ใช้"
                                    class="form-input !pl-12 pr-4 placeholder:text-white-dark"
                                    required
                                />
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                                    <icon-user :fill="true" class="w-5 h-5" />
                                </span>
                            </div>
                        </div>

                        <!-- Password Field -->
                        <div>
                            <label for="password" class="dark:text-white mb-2 block">รหัสผ่าน</label>
                            <div class="relative text-white-dark">
                                <input
                                    id="password"
                                    v-model="form.password"
                                    type="password"
                                    placeholder="กรอกรหัสผ่าน"
                                    class="form-input !pl-12 pr-4 placeholder:text-white-dark"
                                    required
                                />
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                                    <icon-lock-dots :fill="true" class="w-5 h-5" />
                                </span>
                            </div>
                        </div>

                        <!-- Error Message -->
                        <div v-if="authStore.error" class="text-danger text-sm">
                            {{ authStore.error }}
                        </div>

                        <!-- Remember Me -->
                        <div>
                            <label class="flex cursor-pointer items-center">
                                <input
                                    v-model="form.rememberMe"
                                    type="checkbox"
                                    class="form-checkbox bg-white dark:bg-black"
                                />
                                <span class="text-white-dark">จำการเข้าสู่ระบบ</span>
                            </label>
                        </div>

                        <!-- Submit Button -->
                        <button
                            type="submit"
                            class="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                            :disabled="authStore.loading"
                        >
                            <span v-if="authStore.loading" class="mr-2">
                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </span>
                            {{ authStore.loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
                        </button>
                    </form>

                    <!-- System Info -->
                    <div class="mt-8 text-center">
                        <p class="text-xs text-white-dark">
                            P2P Exchange Admin System v1.0
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminAuthStore } from '~/stores/adminAuth'
import IconUser from '~/components/icon/icon-user.vue'
import IconLockDots from '~/components/icon/icon-lock-dots.vue'

// Layout
definePageMeta({
  layout: 'auth-layout'
})

// SEO
useHead({
  title: 'Admin Login | P2P Exchange'
})

// Stores
const authStore = useAdminAuthStore()

// Form data
const form = ref({
  username: '',
  password: '',
  rememberMe: false
})

// Initialize auth และ remember me data
onMounted(async () => {
  // รอให้ auth initialize เสร็จก่อน (ใน case ที่ plugin ยังไม่เสร็จ)
  if (authStore.initializing) {
    await new Promise(resolve => {
      const checkAuth = () => {
        if (!authStore.initializing) {
          resolve(true)
        } else {
          setTimeout(checkAuth, 100)
        }
      }
      checkAuth()
    })
  }

  // ถ้า login อยู่แล้วให้ redirect
  if (authStore.isAuthenticated) {
    await navigateTo('/')
    return
  }

  // Load remember me data
  if (process.client) {
    const rememberStr = localStorage.getItem('admin_remember_user')
    if (rememberStr) {
      try {
        const rememberData = JSON.parse(rememberStr)
        // ตรวจสอบว่าข้อมูลไม่เก่าเกิน 30 วัน
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
        if (rememberData.savedAt > thirtyDaysAgo) {
          form.value.username = rememberData.username
          form.value.rememberMe = true
        } else {
          localStorage.removeItem('admin_remember_user')
        }
      } catch (error) {
        localStorage.removeItem('admin_remember_user')
      }
    }
  }
})

// Methods
const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    return
  }

  const result = await authStore.login(
    form.value.username, 
    form.value.password, 
    form.value.rememberMe
  )
  
  if (result.success) {
    // เข้าสู่ระบบสำเร็จ - ไปหน้า dashboard
    await navigateTo('/')
  }
  // Error จะแสดงผ่าน reactive store
}
</script>

<style scoped>
.form-input {
    width: 100%;
    border-radius: 0.5rem;
    border: 1px solid rgba(224, 230, 237, 1);
    background-color: white;
    padding: 0.75rem 1rem;
    color: black;
    font-size: 0.875rem;
    line-height: 1.25rem;
}

.form-input::placeholder {
    color: #9ca3af;
    opacity: 0.7;
}

.form-input:focus {
    outline: none;
    border-color: #4361ee;
    box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.1);
}

.dark .form-input {
    border-color: #374151;
    background-color: #1f2937;
    color: #e5e7eb;
}

.dark .form-input::placeholder {
    color: #6b7280;
}

.form-checkbox {
    height: 1.25rem;
    width: 1.25rem;
    appearance: none;
    border-radius: 0.25rem;
    border: 1px solid rgba(224, 230, 237, 1);
    background-color: transparent;
}

.form-checkbox:checked {
    border-color: #4361ee;
    background-color: #4361ee;
}

.form-checkbox:focus {
    outline: none;
}

.btn {
    display: inline-flex;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    border: 1px solid transparent;
    padding: 0.5rem 1rem;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-gradient {
    background: linear-gradient(to right, #4361ee, #805dca);
    color: white;
}

.btn-gradient:hover {
    opacity: 0.8;
}

.text-danger {
    color: #e7515a;
}

.text-primary {
    color: #4361ee;
}

.text-white-dark {
    color: #506690;
}
</style>
