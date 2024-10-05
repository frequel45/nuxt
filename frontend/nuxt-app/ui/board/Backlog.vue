<template>
  <div>
    <div class="card-header">
      <p>Backlog</p>
      <p>
        <VscCollapseAll @click="handleGlobalToggle" />
      </p>
    </div>

    <div v-if="tasks?.backlog">
      <TodoCard
        v-for="(task, index) in tasks.backlog"
        :key="index"
        :globalToggle="globalToggle"
        :task="task"
        @setGlobalToggle="setGlobalToggle"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { VscCollapseAll } from '@vscode/codicons-vue'; // Vue package for icons

const globalToggle = ref(false);
const store = useStore();

// Toggle the collapse
const handleGlobalToggle = () => {
  globalToggle.value = !globalToggle.value;
};

// Retrieve tasks from Vuex
const tasks = computed(() => store.state.formattedTasks?.formattedTasks);

// Optionally handle the global toggle
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
