import { useAdminAuthStore } from '~/stores/adminAuth'

export default defineNuxtPlugin(() => {
  // Initialize auth store เมื่อ app start (client-side only)
  if (process.client) {
    const authStore = useAdminAuthStore()
    
    // Background initialization - ไม่ block การ render
    nextTick(() => {
      authStore.initialize().catch(error => {
        console.error('Background auth initialization failed:', error)
      })
    })
  }
})
