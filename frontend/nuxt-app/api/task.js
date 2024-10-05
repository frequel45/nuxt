// apis/tasks.js
// This file contains all the task-related API actions

export const createTask = async (accessToken, fd) => {
  try {
    const response = await $nuxt.$axios.post('/tasks/create', fd, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    const { success, statusCode, data } = response;

    if (success && statusCode === 200) {
      return { success: true, msg: "Task created", task: data };
    } else {
      return { success: false, msg: "Something went wrong" };
    }
  } catch (error) {
    handleErrorResponse(error);
  }
};

export const getFormattedTasks = async (accessToken) => {
  try {
    const response = await $nuxt.$axios.get('/tasks/get-formatted-tasks', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { success, statusCode, data } = response;

    if (success && statusCode === 200) {
      return {
        success: true,
        msg: "Tasks retrieved",
        formattedTasks: data.formattedTasks,
      };
    } else {
      return { success: false, msg: "Failed to retrieve tasks" };
    }
  } catch (error) {
    handleErrorResponse(error);
  }
};

export const updateChecklist = async (taskUpdatedData, accessToken) => {
  try {
    const response = await $nuxt.$axios.patch(
      `/tasks/update-checklist/${taskUpdatedData.taskId}`,
      { changedItems: taskUpdatedData.changedItems },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const { success, statusCode, data } = response;

    if (success && statusCode === 200) {
      return { success: true, msg: "Task updated", task: data?.task };
    } else {
      return { success: false, msg: "Failed to update task" };
    }
  } catch (error) {
    handleErrorResponse(error);
  }
};

export const updateTaskPhase = async (taskToUpdateWithPhase, accessToken) => {
  try {
    const response = await $nuxt.$axios.patch(
      `/tasks/update-task-state/${taskToUpdateWithPhase.taskId}`,
      { state: taskToUpdateWithPhase.state },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const { success, statusCode, data } = response;

    if (success && statusCode === 200) {
      return { success: true, msg: "Task updated", task: data?.task };
    } else {
      return { success: false, msg: "Failed to update task state" };
    }
  } catch (error) {
    handleErrorResponse(error);
  }
};

export const updateTask = async (fd) => {
  try {
    const { accessToken, taskId, taskData } = fd;

    if (!accessToken || !taskId || !taskData) {
      return { success: false, msg: "All fields are mandatory" };
    }

    const response = await $nuxt.$axios.patch(
      `/tasks/update/${taskId}`,
      taskData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const { success, statusCode, data } = response;

    if (success && statusCode === 200) {
      return { success: true, msg: "Task updated", task: data };
    } else {
      return { success: false, msg: "Failed to update task" };
    }
  } catch (error) {
    handleErrorResponse(error);
  }
};

export const getTaskWithId = async (taskId) => {
  try {
    const response = await $nuxt.$axios.get(`/tasks/get-task/${taskId}`);

    const { success, statusCode, data } = response;

    if (success && statusCode === 200) {
      return { success: true, msg: "Task fetched", fetchedTask: data.task };
    } else {
      return { success: false, msg: "Failed to fetch task" };
    }
  } catch (error) {
    handleErrorResponse(error);
  }
};

export const getAllAnalyticsData = async (accessToken) => {
  try {
    const response = await $nuxt.$axios.get(`/tasks/anaytics`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { success, statusCode, data } = response;

    if (success && statusCode === 200) {
      return {
        success: true,
        msg: "Analytics fetched",
        fetchedAnalyticsData: data,
      };
    } else {
      return { success: false, msg: "Failed to fetch analytics" };
    }
  } catch (error) {
    handleErrorResponse(error);
  }
};

export const deleteTaskWithId = async (taskId, accessToken) => {
  try {
    const response = await $nuxt.$axios.delete(`/tasks/delete/${taskId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { success, statusCode } = response;

    if (success && statusCode === 200) {
      return { success: true, msg: "Task deleted" };
    } else {
      return { success: false, msg: "Failed to delete task" };
    }
  } catch (error) {
    handleErrorResponse(error);
  }
};

export const getFormattedTasksThisMonth = async (accessToken) => {
  try {
    const response = await $nuxt.$axios.get(
      `/tasks/get-formatted-tasks-this-month`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const { success, statusCode, data } = response;

    if (success && statusCode === 200) {
      return {
        success: true,
        msg: "Tasks retrieved",
        formattedTasks: data.formattedTasks,
      };
    } else {
      return { success: false, msg: "Failed to retrieve tasks" };
    }
  } catch (error) {
    handleErrorResponse(error);
  }
};

export const getFormattedTasksToday = async (accessToken) => {
  try {
    const response = await $nuxt.$axios.get(
      `/tasks/get-formatted-tasks-this-day`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const { success, statusCode, data } = response;

    if (success && statusCode === 200) {
      return {
        success: true,
        msg: "Tasks retrieved",
        formattedTasks: data.formattedTasks,
      };
    } else {
      return { success: false, msg: "Failed to retrieve tasks" };
    }
  } catch (error) {
    handleErrorResponse(error);
  }
};

// Handle common error responses
const handleErrorResponse = (error) => {
  const status = error?.response?.status;

  if (status === 401) {
    return { success: false, msg: "Unauthorized request" };
  } else if (status === 400) {
    return { success: false, msg: "Bad request" };
  } else if (status === 404) {
    return { success: false, msg: "Resource not found" };
  } else {
    return { success: false, msg: "Something went wrong" };
  }
};
