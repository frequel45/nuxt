import { ref, provide, inject } from 'vue';

// Key for injection
const editTaskSymbol = Symbol();

// Provide function to wrap the state
export function provideEditTask() {
  const showEditTaskBox = ref(false);
  const setShowEditTaskBox = (value) => {
    showEditTaskBox.value = value;
  };

  provide(editTaskSymbol, { showEditTaskBox, setShowEditTaskBox });
}

// Inject function to use in components
export function useEditTask() {
  const context = inject(editTaskSymbol);
  if (!context) {
    throw new Error('useEditTask must be used within a provider!');
  }
  return context;
}
