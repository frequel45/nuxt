<template>
  <div>
    <div class="card-header">
      <p>To do</p>
      <p>
        <TbPlus @click="toggleTodo" />
        <VscCollapseAll @click="handleGlobalToggle" />
      </p>
    </div>
    
    <div v-for="(task, index) in tasks.todo" :key="index">
      <TodoCard
        :globalToggle="globalToggle"
        :task="task"
        @setGlobalToggle="setGlobalToggle"
      />
    </div>
    
    <div v-if="showTodo || showEditTaskBox" class="overflow-container" @click="closeTodoForm">
      <div class="overflow-mid-container todo-form">
        <div class="add-todo-container main-content" @click.stop>
          <div class="main-part-todo-container">
            <div class="input-wrapper">
              <label for="todo-title">
                Title <span>*</span>
              </label>
              <input
                v-model="title"
                ref="titleRef"
                type="text"
                placeholder="Enter Task Title"
                :style="{ border: errors.titleError ? '1px solid var(--error-red)' : '' }"
              />
              <span v-if="errors.titleError" style="margin-top: 5px;">{{ errors.titleError }}</span>
            </div>

            <div class="priority-wrapper">
              <div class="priority-selector-field">
                <p>Select Priority <span>*</span></p>
                <div class="priority-selector-options">
                  <div 
                    class="priority-selector-options-hover" 
                    :class="{ selected: selectedPriority === 'high' }" 
                    @click="handlePriorityClick('high')"
                  >
                    <p class="high-priority-point"></p> HIGH PRIORITY
                  </div>
                  <div 
                    class="priority-selector-options-hover" 
                    :class="{ selected: selectedPriority === 'moderate' }" 
                    @click="handlePriorityClick('moderate')"
                  >
                    <p class="moderate-priority-point"></p> MODERATE PRIORITY
                  </div>
                  <div 
                    class="priority-selector-options-hover" 
                    :class="{ selected: selectedPriority === 'low' }" 
                    @click="handlePriorityClick('low')"
                  >
                    <p class="low-priority-point"></p> LOW PRIORITY
                  </div>
                </div>
              </div>
              <span v-if="errors.priorityError">{{ errors.priorityError }}</span>
            </div>

            <div v-if="loggedInUser?.chosenAssignees.length > 0 && tempSingleTaskData?.assignedTo.toLowerCase() !== loggedInUser?.email" class="assign-to-task">
              <div class="assign-task-menu">
                <p>Assign to</p>
                <div class="select-button" @click="toggleAssignPeople">
                  <p>{{ assignee || 'Add an assignee' }}</p>
                  <p><MdKeyboardArrowDown /></p>
                </div>
              </div>
              <div v-if="showAssignPeople" class="assign-options">
                <div v-for="e in loggedInUser.chosenAssignees" :key="e._id" class="assign-option">
                  <div class="user-details">
                    <p>{{ e.email.slice(0, 2) }}</p>
                    <p>{{ e.email }}</p>
                  </div>
                  <button @click="assignUser(e.email)">{{ assignee === e.email ? 'Assigned' : 'Assign' }}</button>
                </div>
              </div>
            </div>

            <div class="checklist-length">
              <p>Checklist ({{ checklistItems.filter(item => item.isChecked).length }}/{{ checklistItems.length }}) <span>*</span></p>
              <span v-if="errors.checkListError">{{ errors.checkListError }}</span>
            </div>

            <div class="all-checklist-field-container" ref="checklistContainerRef">
              <div v-for="(item, index) in checklistItems" :key="index" class="checklists-field">
                <div class="select-checklist">
                  <input type="checkbox" v-model="item.isChecked" />
                  <input
                    type="text"
                    class="select-checklist-input"
                    v-model="item.title"
                    ref="checklistInputRefs[index]"
                    placeholder="Add a task"
                  />
                </div>
                <MdDelete @click="deleteChecklistItem(index)" />
              </div>
            </div>

            <div class="add-new-box" @click="addChecklistItem">
              <p><BiPlus /></p>
              <p>Add New</p>
            </div>
          </div>

          <div class="action-buttons">
            <button class="due-button" @click="toggleDatePicker">{{ startDate && hasUserClickedOnDateBtn ? startDate.toLocaleDateString() : 'Select Due Date' }}</button>
            <DatePicker v-if="showDatePicker" v-model="startDate" @change="handleDateChange" inline />
            <div class="calendar-buttons-today-clear" v-if="showDatePicker">
              <button @click="handleAddTodayButtonClick">Today</button>
              <button @click="handleClearTodayButtonClick">Clear</button>
            </div>
            <div class="save-cancel-buttons">
              <button @click="closeTodoForm">Cancel</button>
              <button @click="handleTaskCreation">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, useContext } from 'vue';
import { useStore } from 'vuex'; // Vuex for state management
import { TbPlus, VscCollapseAll, MdDelete, MdKeyboardArrowDown, BiPlus } from 'react-icons/all';
import DatePicker from 'vue-datepicker-next'; // Ensure you install a Vue DatePicker library
import { ToastContext } from "../../context/ToastContext"; // Adjust the path as necessary
import { createTask, updateTask } from "../../apis/tasks"; // Adjust the path as necessary
import { addSingleTask, updateSingleTask } from "../../features/tasks/formattedTasksSlice"; // Adjust the path as necessary
import { TempSingleTask } from "../../context/TempSingleTask"; // Adjust the path as necessary
import { EditTaskContext } from "../../context/EditProfileContext"; // Adjust the path as necessary

export default {
  setup() {
    const store = useStore();
    const titleRef = ref(null);
    const checklistContainerRef = ref(null);
    const checklistInputRefs = ref([]);
    
    // Reactive variables
    const showTodo = ref(false);
    const showAssignPeople = ref(false);
    const checklistItems = ref([]);
    const assignee = ref("");
    const startDate = ref(new Date());
    const showDatePicker = ref(false);
    const hasUserClickedOnDateBtn = ref(false);
    const selectedPriority = ref(null);
    const globalToggle = ref(false);
    const errors = ref({ titleError: "", priorityError: "", checkListError: "" });
    
    // Getting data from the store
    const accessToken = store.state.accessToken.accessToken;
    const loggedInUser = store.state.loggedInUser.loggedInUser;
    const tempSingleTaskData = useContext(TempSingleTask).tempSingleTaskData;
    const { showEditTaskBox } = useContext(EditTaskContext);

    const tasks = store.state.formattedTasks.formattedTasks;

    const setToastText = useContext(ToastContext);
    
    const displayToast = (text, success) => {
      setToastText(text);
      success ? toast.success(text) : toast.error(text);
    };

    const closeTodoForm = () => {
      showTodo.value = false;
      showEditTaskBox.value = false;
      setTempSingleTaskData(null);
    };

    const toggleTodo = () => showTodo.value = !showTodo.value;
    const handleGlobalToggle = () => globalToggle.value = !globalToggle.value;
    const toggleAssignPeople = () => showAssignPeople.value = !showAssignPeople.value;

    const handlePriorityClick = (priority) => {
      selectedPriority.value = priority;
      errors.value.priorityError = priority ? "" : "This field is required";
    };

    const assignUser = (email) => {
      assignee.value = assignee.value === email ? "" : email;
      showAssignPeople.value = false;
    };

    const addChecklistItem = () => {
      checklistItems.value.push({ title: "", isChecked: false });
    };

    const deleteChecklistItem = (index) => {
      checklistItems.value.splice(index, 1);
    };

    const handleDateChange = (date) => {
      startDate.value = date;
      showDatePicker.value = false;
      hasUserClickedOnDateBtn.value = true;
    };

    const handleTaskCreation = async () => {
      // Validation logic (similar to original)
      if (!titleRef.value.value) {
        errors.value.titleError = "This field is required";
        titleRef.value.focus();
        displayToast("Title is required", false);
        return;
      }
      if (!selectedPriority.value) {
        errors.value.priorityError = "This field is required";
        displayToast("Priority is required", false);
        return;
      }
      if (checklistItems.value.length === 0 || checklistItems.value.some(item => !item.title)) {
        errors.value.checkListError = "Checklist items must not be empty";
        displayToast("Checklist items must not be empty", false);
        return;
      }

      const newTask = {
        title: titleRef.value.value,
        assignedTo: assignee.value || null,
        priority: selectedPriority.value,
        checklist: checklistItems.value,
        dueDate: startDate.value
      };

      try {
        await createTask(newTask, accessToken);
        displayToast("Task created successfully!", true);
        store.dispatch(addSingleTask(newTask));
        closeTodoForm();
      } catch (error) {
        displayToast("Error creating task", false);
      }
    };

    // Watchers for real-time updates
    watch(tempSingleTaskData, (newValue) => {
      if (newValue) {
        titleRef.value.value = newValue.title;
        selectedPriority.value = newValue.priority;
        assignee.value = newValue.assignedTo;
        checklistItems.value = newValue.checklist;
        startDate.value = newValue.dueDate;
      }
    });

    return {
      showTodo,
      titleRef,
      toggleTodo,
      tasks,
      closeTodoForm,
      handleGlobalToggle,
      checklistItems,
      addChecklistItem,
      deleteChecklistItem,
      startDate,
      handleDateChange,
      showDatePicker,
      handleTaskCreation,
      toggleAssignPeople,
      assignUser,
      selectedPriority,
      errors,
      loggedInUser,
      showAssignPeople,
      globalToggle,
      hasUserClickedOnDateBtn,
      displayToast,
      tempSingleTaskData,
      checklistInputRefs,
    };
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>
