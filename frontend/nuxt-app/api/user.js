// ~/composables/useUserActions.js
import { useRuntimeConfig } from "#app";

// Fetch base URL from runtime configuration (set in nuxt.config.js)
const config = useRuntimeConfig();

export const useUserActions = () => {
  const updateProfile = async (fd, accessToken) => {
    try {
      const response = await $fetch(`${config.public.apiBase}/user/update-profile`, {
        method: 'PUT',
        body: fd,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { data, statusCode, success } = response;

      if (success && statusCode === 200) {
        return { success: true, msg: "User updated", user: data?.user };
      } else {
        return { success: false, msg: "Something went wrong" };
      }
    } catch (error) {
      console.error(error);
      const status = error?.response?.status;
      // Handling different status codes
      if (status === 400) {
        return { success: false, msg: "Old password does not match" };
      } else if (status === 401) {
        return { success: false, msg: "Unauthorized request" };
      } else if (status === 404) {
        return { success: false, msg: "User couldn't be found" };
      } else if (status === 405) {
        return { success: false, msg: "Email already exists" };
      } else if (status === 422) {
        return { success: false, msg: "New password must differ" };
      }

      return { success: false, msg: "Something went wrong" };
    }
  };

  const addAssignee = async (email, accessToken) => {
    try {
      const response = await $fetch(`${config.public.apiBase}/user/add-assignee`, {
        method: 'POST',
        body: { email },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { data, statusCode, success } = response;

      if (success && statusCode === 200) {
        return { success: true, msg: "Assignee added", newAssignee: data };
      } else {
        return { success: false, msg: "Something went wrong" };
      }
    } catch (error) {
      console.error(error);
      const status = error?.response?.status;
      // Handling different status codes
      if (status === 400) {
        return { success: false, msg: "Email is mandatory" };
      } else if (status === 401) {
        return { success: false, msg: "Unauthorized request" };
      } else if (status === 404) {
        return { success: false, msg: "User couldn't be found" };
      } else if (status === 405) {
        return { success: false, msg: "Assignee already exists" };
      }

      return { success: false, msg: "Something went wrong" };
    }
  };

  return { updateProfile, addAssignee };
};
