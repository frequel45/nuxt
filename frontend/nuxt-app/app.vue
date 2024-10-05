<template>
  <main>
    <NuxtPage v-if="!loader" />
    <HomeLoader v-else />
  </main>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { accessToken, setCookie } from '@/utils/cookieActions'; // Adjust the path as necessary
import { loginUserWithToken } from '@/apis/auth'; // Adjust the path as necessary
import HomeLoader from '@/components/HomeLoader.vue'; // Adjust the path as necessary

export default defineComponent({
  components: {
    HomeLoader,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const loader = ref(true);

    onMounted(async () => {
      await fetchUser();
      const expandedCheckList = localStorage.getItem("expandedCheckList");
      if (!expandedCheckList) {
        localStorage.setItem("expandedCheckList", JSON.stringify([])); // Convert empty array to JSON string
      }
    });

    const fetchUser = async () => {
      loader.value = true;
      if (accessToken) {
        const loginUser = await loginUserWithToken();
        const { user, success } = loginUser;
        if (success) {
          setCookie("accessToken", user.accessToken, 1);
          setCookie("refreshToken", user.refreshToken, 7);
          store.dispatch('auth/saveLoggedInUser', user.user);
          store.dispatch('accessToken/saveAccessToken', user.accessToken);
          localStorage.setItem("isCookieFromProManage", true);
        }
      }
      loader.value = false;
    };

    return { loader };
  },
});
</script>

<style>
/* Add your global styles here */
</style>
