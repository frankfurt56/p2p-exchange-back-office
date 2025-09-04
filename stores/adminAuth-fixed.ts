import { defineStore } from 'pinia'
import { supabase } from '~/lib/supabase'
import type { User } from '~/lib/supabase'

interface AdminSessionToken {
  access_token: string
  user_id: string
  username: string
  role: string
  expires_at: number
  created_at: number
}

const generateSecureToken = (userId: string): string => {
  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)
  const randomPart = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('')
  return `admin_${userId}_${Date.now()}_${randomPart}`
}

interface AdminState {
  user: User | null
  loading: boolean
  error: string | null
  initializing: boolean
}

export const useAdminAuthStore = defineStore('adminAuth', {
  state: (): AdminState => ({
    user: null,
    loading: false,
    error: null,
    initializing: true
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    currentUser: (state) => state.user
  },

  actions: {
    async login(username: string, password: string, rememberMe: boolean = false) {
      this.loading = true
      this.error = null

      try {
        if (!username || !password) {
          throw new Error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน')
        }

        if (username.length < 3) {
          throw new Error('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร')
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, username, password_hash, role, is_active, created_at, updated_at')
          .eq('username', username)
          .eq('role', 'admin')
          .eq('is_active', true)
          .single()

        if (userError || !userData) {
          throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง หรือไม่มีสิทธิ์ Admin')
        }

        const { data: isValidPassword, error: passwordError } = await supabase
          .rpc('verify_password', {
            password: password,
            hash: userData.password_hash
          })

        if (passwordError || !isValidPassword) {
          throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
        }

        const cleanUserData: User = {
          id: userData.id,
          username: userData.username,
          role: userData.role,
          is_active: userData.is_active,
          created_at: userData.created_at,
          updated_at: userData.updated_at
        }

        const sessionToken: AdminSessionToken = {
          access_token: generateSecureToken(userData.id),
          user_id: userData.id,
          username: userData.username,
          role: userData.role,
          expires_at: Date.now() + (24 * 60 * 60 * 1000),
          created_at: Date.now()
        }

        if (process.client) {
          localStorage.setItem('admin_session', JSON.stringify(sessionToken))

          if (rememberMe) {
            const rememberData = {
              username,
              savedAt: Date.now()
            }
            localStorage.setItem('admin_remember_user', JSON.stringify(rememberData))
          }
        }

        this.user = cleanUserData
        this.error = null

        console.log('✅ Admin logged in successfully:', { username, role: userData.role })

        return {
          success: true,
          user: cleanUserData,
          token: sessionToken.access_token
        }

      } catch (err: any) {
        this.error = err.message
        console.error('❌ Admin login error:', err.message)
        return { success: false, error: err.message }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      try {
        this.user = null
        this.error = null

        if (process.client) {
          localStorage.removeItem('admin_session')
          localStorage.removeItem('admin_remember_user')
        }

        console.log('✅ Admin logged out successfully')
        
        await navigateTo('/auth/login')

        return { success: true }
      } catch (err: any) {
        this.error = err.message
        return { success: false, error: err.message }
      } finally {
        this.loading = false
      }
    },

    async initialize() {
      this.initializing = true
      this.loading = true

      try {
        if (process.client) {
          const sessionStr = localStorage.getItem('admin_session')
          if (!sessionStr) {
            return false
          }

          const sessionToken: AdminSessionToken = JSON.parse(sessionStr)

          if (sessionToken.expires_at < Date.now()) {
            localStorage.removeItem('admin_session')
            return false
          }

          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, username, role, is_active, created_at, updated_at')
            .eq('id', sessionToken.user_id)
            .eq('role', 'admin')
            .eq('is_active', true)
            .single()

          if (userError || !userData) {
            localStorage.removeItem('admin_session')
            return false
          }

          const cleanUserData: User = {
            id: userData.id,
            username: userData.username,
            role: userData.role,
            is_active: userData.is_active,
            created_at: userData.created_at,
            updated_at: userData.updated_at
          }

          this.user = cleanUserData
          console.log('✅ Admin session restored:', { username: userData.username })
          return true
        }
        return false
      } catch (error) {
        console.error('❌ Admin auth initialization error:', error)
        this.logout()
        return false
      } finally {
        this.initializing = false
        this.loading = false
      }
    },

    getRememberMe() {
      if (process.client) {
        const rememberStr = localStorage.getItem('admin_remember_user')
        if (rememberStr) {
          try {
            const rememberData = JSON.parse(rememberStr)
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
            if (rememberData.savedAt > thirtyDaysAgo) {
              return rememberData.username
            } else {
              localStorage.removeItem('admin_remember_user')
            }
          } catch (error) {
            localStorage.removeItem('admin_remember_user')
          }
        }
      }
      return null
    }
  }
})
