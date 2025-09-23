interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
}

export const useToast = () => {
  const toasts = ref<ToastMessage[]>([])

  const show = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const duration = toast.duration ?? (toast.type === 'error' ? 6000 : 4000)
    
    const newToast: ToastMessage = {
      id,
      ...toast,
      duration
    }

    toasts.value.push(newToast)

    // Auto remove toast after duration (unless persistent)
    if (!toast.persistent) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  const success = (title: string, message?: string, options?: Partial<ToastMessage>) => {
    return show({
      type: 'success',
      title,
      message,
      ...options
    })
  }

  const error = (title: string, message?: string, options?: Partial<ToastMessage>) => {
    return show({
      type: 'error',
      title,
      message,
      ...options
    })
  }

  const info = (title: string, message?: string, options?: Partial<ToastMessage>) => {
    return show({
      type: 'info',
      title,
      message,
      ...options
    })
  }

  const warning = (title: string, message?: string, options?: Partial<ToastMessage>) => {
    return show({
      type: 'warning',
      title,
      message,
      ...options
    })
  }

  const remove = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clear = () => {
    toasts.value = []
  }

  return {
    toasts: readonly(toasts),
    show,
    success,
    error,
    info,
    warning,
    remove,
    clear
  }
}

// Global toast instance
export const toast = useToast()