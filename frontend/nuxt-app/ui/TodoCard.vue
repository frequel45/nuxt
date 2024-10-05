<template>
  <div class="todo-list-container" @click="() => optionsToggle = false">
    <div class="todo-list-container-header" @click.stop>
      <div class="left-text">
        <div v-if="task?.priority === 'low'" class="alert-circle low"></div>
        <div v-if="task?.priority === 'moderate'" class="alert-circle moderate"></div>
        <div v-if="task?.priority === 'high'" class="alert-circle high"></div>
        <p>
          {{ task?.priority }} PRIORITY
          <span v-if="task?.assignedTo && task?.assignedTo?.toLowerCase() !== loggedInUser?.email"
            data-tooltip="task?.assignedTo"
            class="assigned-to-people tooltip-title"
          >
            {{ task?.assignedTo?.slice(0, 2) }}
          </span>
        </p>
      </div>
      <BiDotsHorizontalRounded @click="toggleOptions" />
      <div v-if="optionsToggle" class="menu-container" ref="menuRef" :style="menuStyle">
        <p @click="editTask">Edit</p>
        <p @click="handleShareButtonTask">Share</p>
        <p @click="showDeleteAlert = !showDeleteAlert">Delete</p>
      </div>
    </div>

    <p class="tooltip-title" :data-tooltip="task?.title">
      {{ task?.title.length >= 9 ? task?.title.slice(0, 9) + '...' : task?.title }}
    </p>

    <div class="check-list-container">
      <div class="todo-list-checklist-count">
        <p>
          Checklist <span>({checkedCount}/{{ task?.checklist?.length }})</span>
        </p>
      </div>
      <button @click="handleToggleChecklist" class="btn-collapse-expand">
        <MdKeyboardArrowDown v-if="!showCheckListToggle" />
        <MdKeyboardArrowUp v-else />
      </button>
    </div>

    <div v-if="showCheckListToggle || isCheckListExpanded">
      <div class="checklist-tasks">
        <div v-for="e in task?.checklist" :key="e?._id" class="checklist-task">
          <input type="checkbox" class="checkbox" :checked="!!checkedItems[e._id]" @change="() => handleCheckboxChange(e._id)" />
          <p class="task">{{ e?.title }}</p>
        </div>
      </div>
    </div>

    <div :class="['all-important-details', { 'justify-end': !task?.dueDate }]">
      <p v-if="task?.dueDate" :class="['due-date', task?.state === 'done' ? 'due-date-fulfill-in-time' : dueDateMissed ? 'due-date-missed' : '']">
        {{ formatDueDate(task?.dueDate) }}
      </p>
      <div class="other-details">
        <p v-for="phase in taskPhase.filter(e => e.value !== task?.state)" :key="phase.value" @click="handleChangeTaskPhase(phase.value)">
          {{ phase.title }}
        </p>
      </div>
    </div>

    <div v-if="showDeleteAlert" class="overflow-container" @click="showDeleteAlert = false">
      <div class="overflow-mid-container">
        <div class="main-content" @click.stop>
          <p>Are you sure you want to delete?</p>
          <button @click="handleDeleteTask">Yes, Delete</button>
          <button @click="showDeleteAlert = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onBeforeUnmount, inject } from 'vue';
import { BiDotsHorizontalRounded } from "react-icons/bi"; // Import these icons accordingly
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md"; // Import these icons accordingly
import { formatDueDate } from "../utils/formatDate"; // Adjust path accordingly
import { taskPhase } from "../utils/tasksPhases"; // Adjust path accordingly
import {
  deleteTaskWithId,
  updateChecklist,
  updateTaskPhase,
} from "../apis/tasks"; // Adjust path accordingly
import { useStore } from "vuex"; // Use Vuex for state management
import { ToastContext } from "../context/ToastContext"; // Adjust path accordingly
import { toast } from "react-toastify"; // Adjust toast import accordingly
import { isDueDateMissed } from "../utils/taskUtils"; // Adjust path accordingly
import { EditTaskContext } from "../context/EditProfileContext"; // Adjust path accordingly
import { TempSingleTask } from "../context/TempSingleTask"; // Adjust path accordingly

export default {
  props: {
    globalToggle: Boolean,
    task: Object,
    setGlobalToggle: Function,
  },
  setup(props) {
    const menuRef = ref(null);
    const showDeleteAlert = ref(false);
    const showCheckListToggle = ref(false);
    const checkedItems = ref({});
    const checkedCount = ref(0);
    const optionsToggle = ref(false);
    const dueDateMissed = isDueDateMissed(props.task?.dueDate);
    const { tempSingleTaskData, setTempSingleTaskData } = inject(TempSingleTask);
    const { showEditTaskBox, setShowEditTaskBox } = inject(EditTaskContext);
    const loggedInUser = useStore().state.loggedInUser.loggedInUser;
    const accessToken = useStore().state.accessToken.accessToken;
    const dispatch = useStore().dispatch;
    const setToastText = inject(ToastContext);
    
    watch(
      () => props.task,
      (newTask) => {
        if (newTask) {
          const initialCheckedItems = {};
          let initialCount = 0;
          newTask.checklist.forEach((item) => {
            initialCheckedItems[item._id] = item.isChecked;
            if (item.isChecked) {
              initialCount++;
            }
          });
          checkedItems.value = initialCheckedItems;
          checkedCount.value = initialCount;
        }
      },
      { immediate: true }
    );

    const isCheckListExpanded = ref(false);

    watch(
      () => props.globalToggle,
      (newToggle) => {
        if (newToggle) {
          localStorage.removeItem("expandedCheckList");
          showCheckListToggle.value = false;
        } else {
          const expandedCheckList =
            JSON.parse(localStorage.getItem("expandedCheckList")) || [];
          showCheckListToggle.value = expandedCheckList.includes(props.task._id);
        }
      }
    );

    const handleToggleChecklist = () => {
      optionsToggle.value = false;
      showCheckListToggle.value = !showCheckListToggle.value;

      const expandedCheckList = new Set(
        JSON.parse(localStorage.getItem("expandedCheckList")) || []
      );

      if (showCheckListToggle.value) {
        expandedCheckList.delete(props.task._id);
      } else {
        expandedCheckList.add(props.task._id);
        props.setGlobalToggle(false);
      }

      localStorage.setItem(
        "expandedCheckList",
        JSON.stringify(Array.from(expandedCheckList))
      );
    };

    const displayToast = (text, success) => {
      setToastText(text);
      success ? toast.success(text) : toast.error(text);
    };

    const handleChangeTaskPhase = async (phase) => {
      optionsToggle.value = false;
      const taskToUpdateWithPhase = {
        state: phase,
        taskId: props.task._id,
      };
      const response = await updateTaskPhase(taskToUpdateWithPhase, accessToken);
      const { success, msg, task: updatedTask } = response;

      if (success) {
        dispatch(updateTaskState(updatedTask));
      }
      displayToast(msg, success);
    };

    const handleCheckboxChange = async (itemId) => {
      optionsToggle.value = false;
      const updatedCheckedItems = {
        ...checkedItems.value,
        [itemId]: !checkedItems.value[itemId],
      };
      checkedItems.value = updatedCheckedItems;

      const newCheckedCount = Object.values(updatedCheckedItems).filter(
        (isChecked) => isChecked
      ).length;
      checkedCount.value = newCheckedCount;

      const dataToSend = {
        taskId: props.task._id,
        changedItems: props.task.checklist.map((item) => ({
          itemId: item._id,
          isChecked: updatedCheckedItems[item._id] || false,
        })),
      };

      const response = await updateChecklist(dataToSend, accessToken);
      const { msg, success, task: updatedTask } = response;

      if (success) {
        dispatch(updateCheckListInStore(updatedTask));
      }
      displayToast(msg, success);
    };

    const handleShareButtonTask = () => {
      optionsToggle.value = false;
      const mainUrl = new URL(window.location.href);
      const shareUrl = `${mainUrl.origin}/share/${props.task._id}`;

      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          displayToast("Share link copied", true);
        })
        .catch(() => {
          displayToast("Unable to copy the link", false);
        });
    };

    const editTask = () => {
      optionsToggle.value = false;
      setTempSingleTaskData(props.task);
      setShowEditTaskBox(true);
    };

    const handleDeleteTask = async () => {
      optionsToggle.value = false;
      const response = await deleteTaskWithId(props.task._id, accessToken);
      const { success, msg } = response;

      if (success) {
        dispatch(deleteTaskInStore(props.task._id));
      }
      displayToast(msg, success);
      showDeleteAlert.value = false;
    };

    const toggleOptions = (event) => {
      event.stopPropagation();
      optionsToggle.value = !optionsToggle.value;
    };

    onMounted(() => {
      document.addEventListener("click", () => (optionsToggle.value = false));
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", () => (optionsToggle.value = false));
    });

    const menuStyle = {
      position: "absolute",
      top: "100%",
      right: "0",
      zIndex: "1",
      display: optionsToggle.value ? "block" : "none",
    };

    return {
      menuRef,
      showDeleteAlert,
      showCheckListToggle,
      checkedItems,
      checkedCount,
      optionsToggle,
      dueDateMissed,
      toggleOptions,
      handleToggleChecklist,
      handleChangeTaskPhase,
      handleCheckboxChange,
      handleShareButtonTask,
      editTask,
      handleDeleteTask,
      isCheckListExpanded,
      menuStyle,
      formatDueDate,
      taskPhase,
    };
  },
};
</script>

<style scoped>
/* Add your CSS styles here */
</style>
