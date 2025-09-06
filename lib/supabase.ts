import { createClient } from '@supabase/supabase-js'

// ตรวจสอบว่าอยู่ใน browser หรือไม่
const supabaseUrl = typeof window !== 'undefined'
  ? window.location.protocol + '//' + window.location.hostname.includes('localhost') 
    ? 'https://nmqlvnzeaotmjzscxphg.supabase.co'
    : 'https://nmqlvnzeaotmjzscxphg.supabase.co'
  : process.env.NUXT_PUBLIC_SUPABASE_URL || 'https://nmqlvnzeaotmjzscxphg.supabase.co'

const supabaseAnonKey = typeof window !== 'undefined'
  ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tcWx2bnplYW90bWp6c2N4cGhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NDA0MzMsImV4cCI6MjA3MTAxNjQzM30.iFzLPvkBqOWJ5_mhkfvh6KgWOwp3QcjtL33u-k0-1zc'
  : process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tcWx2bnplYW90bWp6c2N4cGhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NDA0MzMsImV4cCI6MjA3MTAxNjQzM30.iFzLPvkBqOWJ5_mhkfvh6KgWOwp3QcjtL33u-k0-1zc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables (copied from main project)
export interface User {
  id: string
  username: string
  password_hash?: string
  email?: string
  full_name?: string
  phone?: string
  role: 'admin' | 'user' | 'moderator' // ใช้ role ตาม frontend ที่มีอยู่
  is_active: boolean
  kyc_status?: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  user_name?: string
  order_reference?: string
  transaction_type: 'buy' | 'sell'
  from_currency: string
  to_currency: string
  from_amount: number | string
  to_amount: number | string
  exchange_rate: number | string
  status: string
  selected_network: string
  recipient_wallet_address?: string
  customer_bank_code?: string
  customer_account_number?: string
  customer_account_name?: string
  customer_receive_bank_code?: string
  customer_receive_account_number?: string
  customer_receive_account_name?: string
  customer_receive_bank_accounts?: Array<{
    bank: string
    amount: string
    accountName: string
    accountNumber: string
  }>
  payment_slip_url?: string
  usdt_from_wallet_address?: string
  usdt_transfer_hash?: string
  usdt_transferred_at?: string
  txid_screenshot_url?: string
  submitted_at?: string
  submitted_at_th?: string
  admin_reviewed_by?: string
  admin_reviewed_at?: string
  admin_notes?: string
  created_at: string
  created_at_th?: string
  updated_at?: string
  updated_at_th?: string
}

export interface BankAccount {
  id: string
  bank_code: string
  account_number: string
  account_name: string
  is_active: boolean
  created_at: string
  bank_codes?: {
    bank_name: string
    bank_name_en: string
  }
}

export interface UsdtPrice {
  id: number
  buy_price: number
  sell_price: number
  updated_at: string
}

export interface SystemSetting {
  id: string
  setting_key: string
  setting_value: string
  description?: string
  updated_at: string
}

// Admin API functions
export const adminAPI = {
  // Dashboard Stats
  async getDashboardStats() {
    try {
      // Get transaction stats
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('status, transaction_type, to_amount, created_at')

      if (transError) throw transError

      // Get user count
      const { count: userCount, error: userError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      if (userError) throw userError

      // Calculate stats
      const stats = transactions?.reduce((acc: Record<string, number>, transaction) => {
        const { status, to_amount } = transaction
        
        if (!acc[status]) acc[status] = 0
        acc[status]++
        
        if (!acc.totalVolume) acc.totalVolume = 0
        if (status === 'completed') {
          acc.totalVolume += to_amount
        }
        
        return acc
      }, {})

      return {
        totalTransactions: transactions?.length || 0,
        totalUsers: userCount || 0,
        ...stats
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  },

  // Transaction Management
  async getTransactions(status?: string) {
    let query = supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data as Transaction[]
  },

  async updateTransactionStatus(transactionId: string, status: string, adminNotes?: string) {
    const updateData: Record<string, any> = { 
      status,
      updated_at: new Date().toISOString(),
      admin_reviewed_at: new Date().toISOString()
      // TODO: Add admin_reviewed_by when we have proper admin user UUID
      // admin_reviewed_by: adminUserId
    }
    
    if (adminNotes) {
      updateData.admin_notes = adminNotes
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId)
      .select()
      .single()
    
    if (error) throw error
    return data as Transaction
  },

  async getTransactionByReference(orderReference: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('order_reference', orderReference)
      .single()
    
    if (error) throw error
    return data as Transaction
  },

  // User Management
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as User[]
  },

  async updateUserStatus(userId: string, isActive: boolean) {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Bank Account Management
  async getBankAccounts() {
    const { data, error } = await supabase
      .from('store_bank_accounts')
      .select(`
        *,
        bank_codes (
          bank_name,
          bank_name_en
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async updateBankAccountStatus(accountId: string, isActive: boolean) {
    const { data, error } = await supabase
      .from('store_bank_accounts')
      .update({ is_active: isActive })
      .eq('id', accountId)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // System Settings
  async getSettings() {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('setting_key')
    
    if (error) throw error
    return data as SystemSetting[]
  },

  async updateSetting(key: string, value: string) {
    const { data, error } = await supabase
      .from('system_settings')
      .upsert({ 
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (error) throw error
    return data[0]
  },

  // USDT Price Management
  async getUsdtPrice() {
    const { data, error } = await supabase
      .from('usdt_price')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error) throw error
    return data as UsdtPrice
  },

  async updateUsdtPrice(buyPrice: number, sellPrice: number) {
    const { data, error } = await supabase
      .from('usdt_price')
      .insert({
        buy_price: buyPrice,
        sell_price: sellPrice,
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (error) throw error
    return data[0]
  }
}
