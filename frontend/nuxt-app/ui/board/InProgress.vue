<template>
  <div>
    <div class="card-header">
      <p>In Progress</p>
      <p>
        <VscCollapseAll @click="handleGlobalToggle" />
      </p>
    </div>

    <div v-if="tasks?.inprogress">
      <TodoCard
        v-for="(task, index) in tasks.inprogress"
        :key="index"
        :globalToggle="globalToggle"
        :task="task"
        @setGlobalToggle="setGlobalToggle"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { VscCollapseAll } from '@vscode/codicons-vue'; // Icon library

// State for toggling task collapse
const globalToggle = ref(false);
const store = useStore();

// Function to toggle the state
const handleGlobalToggle = () => {
  globalToggle.value = !globalToggle.value;
};

// Computed property to get tasks from Vuex store
const tasks = computed(() => store.state.formattedTasks?.formattedTasks);

// Emit function to handle global toggle
const setGlobalToggle = (newValue) => {
  globalToggle.value = newValue;
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
