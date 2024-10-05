<template>
  <div class="board-container">
    <div class="board-header">
      <p>
        Welcome! <span>{{ loggedInUser?.fullName }}</span>
      </p>
      <span>{{ boardDate() }}</span>
    </div>
    <div class="board-second-options">
      <div class="board-add-people">
        <p>Board</p>
        <p @click="setShowPeople(!showPeople)">
          <GoPeople />
          <span>Add people</span>
        </p>
      </div>
      <select name="timeframe" id="timeframe" v-model="timeframe" @change="handleTimeframeChange">
        <option value="0">This Week</option>
        <option value="1">Today</option>
        <option value="2">This Month</option>
      </select>
    </div>

    <Spinner v-if="loader" />

    <div v-else class="board-all-cards">
      <div class="card">
        <Backlog />
      </div>
      <div class="card">
        <Todo />
      </div>
      <div class="card">
        <InProgress />
      </div>
      <div class="card">
        <Done />
      </div>
    </div>

    <div
      v-if="showPeople"
      class="overflow-container"
      @click="hidePeopleModal"
    >
      <div class="overflow-mid-container" @click.stop>
        <div v-if="addedAlert" class="main-content">
          <div class="alert-notification">
            <p>{{ email }} added to board</p><br />
            <button @click="hidePeopleModal">Okay, got it!</button>
          </div>
        </div>

        <div v-else class="main-content">
          <p class="add-people-text">Add people to the board</p>

          <input
            v-model="email"
            placeholder="Enter the email"
            type="text"
            ref="emailRef"
            :class="{'input-field': true, 'error-border': errors.email}"
            :style="errors.email ? { border: '1px solid var(--error-red)' } : {}"
          />
          <span v-if="errors.email" style="margin-top: -15px">{{ errors.email }}</span>

          <div class="flex-button-overflow-container">
            <button @click="hidePeopleModal">Cancel</button>
            <button @click="handleAddEmail">Add Email</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { useStore } from '~~/store'; // Assuming Pinia or Vuex is set up
import Backlog from '~~/components/board/Backlog.vue';
import Todo from '~~/components/board/Todo.vue';
import InProgress from '~~/components/board/InProgress.vue';
import Done from '~~/components/board/Done.vue';
import Spinner from '~~/components/Spinner.vue';
import { GoPeople } from 'vue-icons/go'; // Using vue-icons for consistency
import { isValidEmail } from '~~/utils/emailValidation';
import { addAssignee } from '~~/apis/user';
import { getFormattedTasks, getFormattedTasksThisMonth, getFormattedTasksToday } from '~~/apis/tasks';
import { boardDate } from '~~/utils/boardUtils';

const showPeople = ref(false);
const addedAlert = ref(false);
const timeframe = ref("0");
const email = ref("");
const errors = reactive({ email: "" });
const loader = ref(false);
const toast = useToast();
const emailRef = ref(null);

const store = useStore(); // Accessing global state
const accessToken = store.state.accessToken; // Assuming Pinia/Vuex holds accessToken
const loggedInUser = store.state.loggedInUser;

const displayToast = (text, success) => {
  success ? toast.success(text) : toast.error(text);
};

const handleAddEmail = async () => {
  let emailError = "";
  let valid = true;
  if (!email.value) {
    emailError = "This field is required";
    valid = false;
  } else if (!isValidEmail(email.value)) {
    emailError = "Invalid email format";
    valid = false;
  }

  if (valid) {
    const response = await addAssignee(email.value, accessToken);
    const { success, newAssignee, msg } = response;
    if (success) {
      addedAlert.value = true;
      store.commit('addAssigneeToRedux', newAssignee); // Assuming Pinia or Vuex mutation
      displayToast(msg, success);
    } else {
      displayToast(msg, success);
    }
  }
  errors.email = emailError;
};

const handleEmailChange = (e) => {
  email.value = e.target.value;
  errors.email = email.value === "" ? "This field is required" : !isValidEmail(email.value) ? "Invalid email format" : "";
};

watch(showPeople, () => {
  errors.email = "";
  email.value = "";
});

const hidePeopleModal = () => {
  showPeople.value = false;
  addedAlert.value = false;
};

const fetchTasks = async (selectedTimeframe) => {
  let response;
  switch (selectedTimeframe) {
    case "1":
      response = await getFormattedTasksToday(accessToken);
      break;
    case "2":
      response = await getFormattedTasksThisMonth(accessToken);
      break;
    default:
      response = await getFormattedTasks(accessToken);
  }
  const { success, formattedTasks, msg } = response;
  if (success) {
    store.commit('saveFormattedTasks', formattedTasks);
    displayToast(msg, success);
  } else {
    displayToast(msg, success);
  }
};

const handleTimeframeChange = async (e) => {
  await fetchTasks(e.target.value);
};

onMounted(async () => {
  loader.value = true;
  try {
    const response = await getFormattedTasks(accessToken);
    const { success, formattedTasks, msg } = response;
    if (success) {
      store.commit('saveFormattedTasks', formattedTasks);
      displayToast(msg, success);
    }
  } catch (error) {
    displayToast("Error fetching tasks", false);
  } finally {
    loader.value = false;
  }
});
</script>

<style scoped>
/* Add your scoped CSS here */
.board-container {
  background-color: aliceblue;
}
.error-border {
  border: 1px solid var(--error-red);
}
</style>
