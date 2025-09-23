<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] space-y-2" style="z-index: 10000;">
      <TransitionGroup
        name="toast"
        tag="div"
        class="space-y-2"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="getToastClasses(toast.type)"
          class="min-w-[320px] max-w-[480px] p-4 rounded-lg shadow-lg border-l-4 animate-slide-in-right"
        >
          <div class="flex items-start">
            <!-- Icon -->
            <div class="flex-shrink-0 mr-3">
              <div :class="getIconClasses(toast.type)" class="w-5 h-5">
                <!-- Success Icon -->
                <svg v-if="toast.type === 'success'" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <!-- Error Icon -->
                <svg v-else-if="toast.type === 'error'" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <!-- Warning Icon -->
                <svg v-else-if="toast.type === 'warning'" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <!-- Info Icon -->
                <svg v-else fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            
            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div :class="getTitleClasses(toast.type)" class="text-sm font-medium">
                {{ toast.title }}
              </div>
              <div v-if="toast.message" class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {{ toast.message }}
              </div>
            </div>

            <!-- Close button -->
            <div class="flex-shrink-0 ml-3">
              <button
                @click="remove(toast.id)"
                class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Progress bar for timed toasts -->
          <div
            v-if="!toast.persistent && toast.duration"
            class="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
          >
            <div
              :class="getProgressClasses(toast.type)"
              class="h-full animate-toast-progress"
              :style="{ animationDuration: `${toast.duration}ms` }"
            ></div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { toast } from '~/composables/useToast'

const { toasts, remove } = toast

const getToastClasses = (type: string) => {
  const baseClasses = 'bg-white dark:bg-gray-800 border shadow-lg'
  
  switch (type) {
    case 'success':
      return `${baseClasses} border-l-green-500`
    case 'error':
      return `${baseClasses} border-l-red-500`
    case 'warning':
      return `${baseClasses} border-l-yellow-500`
    case 'info':
    default:
      return `${baseClasses} border-l-blue-500`
  }
}

const getIconClasses = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-green-500'
    case 'error':
      return 'text-red-500'
    case 'warning':
      return 'text-yellow-500'
    case 'info':
    default:
      return 'text-blue-500'
  }
}

const getTitleClasses = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-green-800 dark:text-green-200'
    case 'error':
      return 'text-red-800 dark:text-red-200'
    case 'warning':
      return 'text-yellow-800 dark:text-yellow-200'
    case 'info':
    default:
      return 'text-blue-800 dark:text-blue-200'
  }
}

const getProgressClasses = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-500'
    case 'error':
      return 'bg-red-500'
    case 'warning':
      return 'bg-yellow-500'
    case 'info':
    default:
      return 'bg-blue-500'
  }
}
</script>

<style scoped>
/* Toast animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Slide in animation */
@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}

/* Progress bar animation */
@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.animate-toast-progress {
  animation: toast-progress linear forwards;
}
</style>