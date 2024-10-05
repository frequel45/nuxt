<template>
  <div class="public-page-container">
    <div class="public-page-heading">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 15.9999V7.9999C20.9996 7.64918 20.9071 7.30471 20.7315 7.00106C20.556 6.69742 20.3037 6.44526 20 6.2699L13 2.2699C12.696 2.09437 12.3511 2.00195 12 2.00195C11.6489 2.00195 11.304 2.09437 11 2.2699L4 6.2699C3.69626 6.44526 3.44398 6.69742 3.26846 7.00106C3.09294 7.30471 3.00036 7.64918 3 7.9999V15.9999C3.00036 16.3506 3.09294 16.6951 3.26846 16.9987C3.44398 17.3024 3.69626 17.5545 4 17.7299L11 21.7299C11.304 21.9054 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9054 13 21.7299L20 17.7299C20.3037 17.5545 20.556 17.3024 20.7315 16.9987C20.9071 16.6951 20.9996 16.3506 21 15.9999Z"
          stroke="black" stroke-linecap="round" stroke-linejoin="round"
        />
        <path d="M7.5 4.20996L12 6.80996L16.5 4.20996" stroke="black" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M7.5 19.79V14.6L3 12" stroke="black" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M21 12L16.5 14.6V19.79" stroke="black" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M3.27002 6.95996L12 12.01L20.73 6.95996" stroke="#1A87D7" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M12 22.08V12" stroke="#1A87D7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <p>Pro Manage</p>
    </div>

    <div v-if="loader" class="loader-container">
      <Spinner />
    </div>

    <div v-else-if="task" class="public-task-container">
      <div class="public-task-mid-container">
        <div class="todo-list-container">
          <div class="todo-list-container-header">
            <div class="left-text">
              <div v-if="task.priority === 'low'" class="alert-circle low"></div>
              <div v-else-if="task.priority === 'moderate'" class="alert-circle moderate"></div>
              <div v-else-if="task.priority === 'high'" class="alert-circle high"></div>
              <p>{{ task.priority }} PRIORITY</p>
            </div>
          </div>

          <p class="title">{{ task.title }}</p>

          <div class="check-list-container">
            <div class="todo-list-checklist-count">
              <p>
                Checklist
                <span>({{ checkedCount }}/{{ task.checklist.length }})</span>
              </p>
            </div>
          </div>

          <div class="checklist-tasks">
            <div v-for="(checkItem, index) in task.checklist" :key="index" class="checklist-task">
              <input
                type="checkbox"
                :checked="checkItem.isChecked"
                class="checkbox"
                @click="handleInputCheck"
                readonly
              />
              <p class="task">{{ checkItem.title }}</p>
            </div>
          </div>

          <div v-if="task.dueDate" class="all-important-details">
            <div>
              <p class="due-date-public">Due Date</p>
              <button>{{ formatDueDate(task.dueDate) }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="public-task-not-found-error">
      <p>OOPS! TASK COULDN'T BE FOUND!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, useContext } from 'vue';
import { useRoute } from 'vue-router';
import Spinner from '~/components/Spinner.vue';
import { formatDueDate } from '~/utils/formatDate';
import { getTaskWithId } from '~/apis/tasks';
import { useToast } from '~/context/ToastContext';

const task = ref(null);
const loader = ref(false);
const toast = useToast();
const route = useRoute();
const checkedCount = ref(0);

const displayToast = (text, success) => {
  if (success) {
    toast.success(text);
  } else {
    toast.error(text);
  }
};

const handleInputCheck = () => {
  displayToast('Public page, Read only', false);
};

onMounted(async () => {
  loader.value = true;
  const { taskId } = route.params;
  const response = await getTaskWithId(taskId);
  const { success, msg, fetchedTask } = response;
  
  if (success) {
    task.value = fetchedTask;
    checkedCount.value = fetchedTask.checklist.filter((e) => e.isChecked).length;
  } else {
    displayToast(msg, success);
  }
  loader.value = false;
});
</script>

<style scoped>
/* Your existing CSS from "public-page.css" */
</style>
