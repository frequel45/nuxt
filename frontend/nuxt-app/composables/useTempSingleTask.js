import { ref, provide, inject } from 'vue';

// Key for injection
const tempSingleTaskSymbol = Symbol();

// Provide function to wrap the state
export function provideTempSingleTask() {
  const tempSingleTaskData = ref(null);
  const setTempSingleTaskData = (data) => {
    tempSingleTaskData.value = data;
  };

  provide(tempSingleTaskSymbol, { tempSingleTaskData, setTempSingleTaskData });
}

// Inject function to use in components
export function useTempSingleTask() {
  const context = inject(tempSingleTaskSymbol);
  if (!context) {
    throw new Error('useTempSingleTask must be used within a provider!');
  }
  return context;
}
