<template>
  <nav class="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-12">
        <!-- Left: Logo & Brand -->
        <div class="flex items-center space-x-3">
          <!-- Logo Placeholder - Clickable -->
          <button 
            @click="handleLogoClick"
            class="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
            title="กลับสู่หน้า Dashboard"
          >
            <div class="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
              <span class="text-white font-bold text-xs">ADM</span>
            </div>
            <div class="ml-2 hidden sm:block">
              <h1 class="text-lg font-bold text-gray-900 dark:text-white">
                P2P Admin Panel
              </h1>
              <p class="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                ระบบจัดการ Admin
              </p>
            </div>
          </button>
        </div>

        <!-- Center: Navigation Links -->
        <div class="hidden md:flex items-center space-x-8">
          <button
            @click="handleNavigation('transactions')"
            class="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ธุรกรรม
          </button>
          <button
            @click="handleNavigation('users')"
            class="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ผู้ใช้
          </button>
          <button
            @click="handleNavigation('settings')"
            class="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ตั้งค่า
          </button>
        </div>

        <!-- Right: User Menu & Theme Switcher -->
        <div class="flex items-center space-x-3">
          <!-- Theme Switcher -->
          <ThemeSwitcher />
          
          <!-- User Dropdown -->
          <div class="relative">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-medium">
                  {{ user?.username?.charAt(0).toUpperCase() }}
                </span>
              </div>
              <span class="hidden sm:block">{{ user?.username }}</span>
              <div class="hidden sm:block">
                <span class="text-xs text-red-600 font-semibold">ADMIN</span>
              </div>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            
            <!-- User Dropdown Menu -->
            <div 
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
              @click.stop
            >
              <!-- User Info -->
              <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ user?.username }}</p>
                <p class="text-xs text-red-600 font-semibold">ADMIN</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">ออนไลน์</p>
              </div>
              
              <!-- Dashboard -->
              <button
                @click="handleNavigation('dashboard')"
                class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <span>Dashboard</span>
              </button>
              
              <!-- Transaction Management -->
              <button
                @click="handleNavigation('transactions')"
                class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <span>จัดการธุรกรรม</span>
              </button>
              
              <!-- User Management -->
              <button
                @click="handleNavigation('users')"
                class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
                </svg>
                <span>จัดการผู้ใช้</span>
              </button>
              
              <!-- Settings -->
              <button
                @click="handleNavigation('settings')"
                class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>ตั้งค่าระบบ</span>
              </button>
              
              <!-- Divider -->
              <div class="border-t border-gray-200 dark:border-gray-600 my-2"></div>
              
              <!-- Logout -->
              <button
                @click="handleLogout"
                class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useAdminAuthStore } from '~/stores/adminAuth'
import ThemeSwitcher from './ThemeSwitcher.vue'

// Props
const props = defineProps({
  currentView: {
    type: String,
    default: 'dashboard'
  }
})

// Stores
const authStore = useAdminAuthStore()

// Computed
const user = computed(() => authStore.currentUser)

// Local state
const showUserMenu = ref(false)

// Methods
const handleNavigation = (view) => {
  showUserMenu.value = false
  
  // Route ตาม view
  switch (view) {
    case 'dashboard':
      navigateTo('/')
      break
    case 'transactions':
      navigateTo('/transactions')
      break
    case 'users':
      navigateTo('/users')
      break
    case 'settings':
      navigateTo('/settings')
      break
    default:
      navigateTo('/')
  }
}

const handleLogoClick = () => {
  handleNavigation('dashboard')
}

const handleLogout = async () => {
  showUserMenu.value = false
  await authStore.logout()
}

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', () => {
    showUserMenu.value = false
  })
})
</script>
