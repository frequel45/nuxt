<template>
  <div class="analytics-container">
    <p class="analytics-header">Analytics</p>
    <div v-if="loader" class="loader-container-analytics">
      <Spinner />
    </div>
    <div v-else class="analytics-cards">
      <div class="analytics-card">
        <div class="analytics-card-option">
          <div class="analytics-card-option-header">
            <div class="blue-dot"></div>
            <p>Backlog Tasks</p>
          </div>
          <span>{{ analytics?.stateCounts?.backlog || "0" }}</span>
        </div>
        <div class="analytics-card-option">
          <div class="analytics-card-option-header">
            <div class="blue-dot"></div>
            <p>To-do Tasks</p>
          </div>
          <span>{{ analytics?.stateCounts?.todo || "0" }}</span>
        </div>
        <div class="analytics-card-option">
          <div class="analytics-card-option-header">
            <div class="blue-dot"></div>
            <p>In-Progress Tasks</p>
          </div>
          <span>{{ analytics?.stateCounts?.inprogress || "0" }}</span>
        </div>
        <div class="analytics-card-option">
          <div class="analytics-card-option-header">
            <div class="blue-dot"></div>
            <p>Completed Tasks</p>
          </div>
          <span>{{ analytics?.stateCounts?.done || "0" }}</span>
        </div>
      </div>

      <div class="analytics-card">
        <div class="analytics-card-option">
          <div class="analytics-card-option-header">
            <div class="blue-dot"></div>
            <p>Low Priority</p>
          </div>
          <span>{{ analytics?.priorityCounts?.low || "0" }}</span>
        </div>
        <div class="analytics-card-option">
          <div class="analytics-card-option-header">
            <div class="blue-dot"></div>
            <p>High Priority</p>
          </div>
          <span>{{ analytics?.priorityCounts?.high || "0" }}</span>
        </div>
        <div class="analytics-card-option">
          <div class="analytics-card-option-header">
            <div class="blue-dot"></div>
            <p>Moderate Priority</p>
          </div>
          <span>{{ analytics?.priorityCounts?.moderate || "0" }}</span>
        </div>
        <div class="analytics-card-option">
          <div class="analytics-card-option-header">
            <div class="blue-dot"></div>
            <p>Due Date Tasks</p>
          </div>
          <span>{{ analytics?.dueDateCounts || "0" }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { useStore } from '~~/store';
import Spinner from '~~/components/Spinner.vue';
import { getAllAnalyticsData } from '~~/apis/tasks';

const analytics = ref(null);
const loader = ref(false);
const toast = useToast();
const store = useStore(); // Access store for tokens

const displayToast = (text, success) => {
  if (success) {
    toast.success(text);
  } else {
    toast.error(text);
  }
};

onMounted(async () => {
  loader.value = true;
  const accessToken = store.accessToken; // Getting token from state
  const response = await getAllAnalyticsData(accessToken);
  const { msg, success, fetchedAnalyticsData } = response;

  if (success) {
    analytics.value = fetchedAnalyticsData;
  }
  displayToast(msg, success);
  loader.value = false;
});
</script>

<style scoped>
/* Add your styles here */
.analytics-container {
  /* Styling for analytics component */
}
</style>
