import { inject, ref } from 'vue';
import { useToast } from 'vue-toastification';

// Symbol for toast injection
const toastSymbol = Symbol();

// Provide function to wrap toast functionality
export function provideToast() {
  const toast = useToast();

  // This ref will store the toast text (optional)
  const toastText = ref('');

  const showToast = (message, options = {}) => {
    toastText.value = message; // Set the toast text
    toast.success(message, { ...options });
  };

  return {
    showToast,
    toastText
  };
}

// Inject function to use the toast in components
export function useToastContext() {
  const context = inject(toastSymbol);
  if (!context) {
    throw new Error('useToastContext must be used within a provider!');
  }
  return context;
}
