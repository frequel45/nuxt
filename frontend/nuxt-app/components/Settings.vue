<template>
  <div class="settings-container">
    <p class="settings-header">Settings</p>
    <form class="auth-form settings-form" @submit.prevent="handleSubmit">
      <div class="input-field-error-wrapper">
        <div :class="['input-field', errors.fullName ? 'error-border' : '']">
          <label for="fullName">
            <FaRegUser class="user-svg" fill="rgb(166, 157, 157)" />
          </label>
          <input
            ref="fullNameRef"
            placeholder="Name"
            v-model="fullName"
            type="text"
            name="fullName"
            id="fullName"
          />
        </div>
        <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
      </div>

      <div class="input-field-error-wrapper">
        <div :class="['input-field', errors.email ? 'error-border' : '']">
          <label for="email">
            <HiOutlineMail />
          </label>
          <input
            ref="emailRef"
            placeholder="Email"
            v-model="email"
            type="email"
            name="email"
            id="email"
          />
        </div>
        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
      </div>

      <div class="input-field-error-wrapper">
        <div :class="['input-field', errors.oldPassword ? 'error-border' : '']">
          <label for="oldPassword">
            <CiLock fill="rgb(166, 157, 157)" />
          </label>
          <input
            ref="oldPasswordRef"
            placeholder="Old password"
            :type="showPassword ? 'text' : 'password'"
            v-model="oldPassword"
            name="oldPassword"
            id="oldPassword"
          />
          <CgEye
            class="eye-icon"
            :class="{ 'show-password-highlight': showPassword }"
            @click="showPassword = !showPassword"
          />
        </div>
        <span v-if="errors.oldPassword" class="error-message">{{ errors.oldPassword }}</span>
      </div>

      <div class="input-field-error-wrapper">
        <div :class="['input-field', errors.password ? 'error-border' : '']">
          <label for="password">
            <CiLock fill="rgb(166, 157, 157)" />
          </label>
          <input
            ref="passwordRef"
            placeholder="Password"
            :type="showCpassword ? 'text' : 'password'"
            v-model="password"
            name="password"
            id="password"
          />
          <CgEye
            class="eye-icon"
            :class="{ 'show-password-highlight': showCpassword }"
            @click="showCpassword = !showCpassword"
          />
        </div>
        <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
      </div>

      <div class="click-button">
        <button type="submit">Update</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, useContext } from 'vue';
import { HiOutlineMail } from 'react-icons/hi';
import { CiLock } from 'react-icons/ci';
import { CgEye } from 'react-icons/cg';
import { FaRegUser } from 'react-icons/fa6';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification/composition';
import { updateProfile } from '../apis/user'; // Adjust according to your API structure
import { deleteAllCookies } from '../utils/cookieActions';
import { useLoggedInUser, useAccessToken } from '../stores/auth';
import { isValidEmail } from '../utils/emailValidation';

const router = useRouter();
const toast = useToast();

const loggedInUser = useLoggedInUser();
const accessToken = useAccessToken();

const fullName = ref(loggedInUser?.fullName || '');
const email = ref(loggedInUser?.email || '');
const oldPassword = ref('');
const password = ref('');
const showPassword = ref(false);
const showCpassword = ref(false);
const errors = reactive({
  fullName: '',
  email: '',
  oldPassword: '',
  password: ''
});

// Refs for input fields
const fullNameRef = ref(null);
const emailRef = ref(null);
const oldPasswordRef = ref(null);
const passwordRef = ref(null);

const initialFormValues = reactive({
  fullName: loggedInUser?.fullName || '',
  email: loggedInUser?.email || '',
  oldPassword: '',
  password: ''
});

// Toast helper
const displayToast = (text, success) => {
  if (success) {
    toast.success(text);
  } else {
    toast.error(text);
  }
};

const handleSubmit = async () => {
  const changes = {
    fullName: fullName.value !== initialFormValues.fullName,
    email: email.value !== initialFormValues.email,
    oldPassword: oldPassword.value !== '',
    password: password.value !== ''
  };

  const changesMade = Object.values(changes).some(change => change);

  if (!changesMade) {
    displayToast('No changes have been made', false);
    return;
  }

  let valid = true;

  if (changes.fullName && !fullName.value) {
    errors.fullName = 'This field is required';
    valid = false;
  }
  if (changes.email) {
    if (!email.value) {
      errors.email = 'This field is required';
      valid = false;
    } else if (!isValidEmail(email.value)) {
      errors.email = 'Invalid email format';
      valid = false;
    }
  }

  if (changes.oldPassword) {
    if (!password.value) {
      errors.password = 'New password is required after changing old password';
      valid = false;
    } else if (password.value) {
      'successfully logged in;'
    }
  }
}