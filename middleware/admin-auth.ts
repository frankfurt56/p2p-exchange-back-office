import { useAdminAuthStore } from '~/stores/adminAuth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  // ถ้าเป็น server-side ให้ข้ามไป (เพราะไม่มี localStorage)
  if (process.server) {
    return
  }

  const authStore = useAdminAuthStore()

  // ตรวจสอบ session โดยตรงจาก localStorage ก่อน
  let hasValidSession = false
  
  try {
    const sessionStr = localStorage.getItem('admin_session')
    if (sessionStr) {
      const sessionToken = JSON.parse(sessionStr)
      // ตรวจสอบเบื้องต้นว่า session ยังไม่หมดอายุ
      if (sessionToken.expires_at > Date.now()) {
        hasValidSession = true
      } else {
        // Session หมดอายุ ลบทิ้ง
        localStorage.removeItem('admin_session')
        localStorage.removeItem('admin_remember_user')
      }
    }
  } catch (error) {
    // Session data corrupted
    localStorage.removeItem('admin_session')
    localStorage.removeItem('admin_remember_user')
  }

  // ถ้ามี session และยังไม่ได้ authenticated ใน store ให้ initialize
  if (hasValidSession && !authStore.isAuthenticated) {
    try {
      await authStore.initialize()
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      hasValidSession = false
    }
  }

  // ใช้การตรวจสอบแบบ combined (localStorage + store)
  const isAuthenticated = hasValidSession || authStore.isAuthenticated

  // ถ้าไม่ได้ login และไม่ได้อยู่ในหน้า login
  if (!isAuthenticated && to.path !== '/auth/login') {
    return navigateTo('/auth/login')
  }

  // ถ้า login แล้วแต่พยายามเข้าหน้า login
  if (isAuthenticated && to.path === '/auth/login') {
    return navigateTo('/')
  }
})
