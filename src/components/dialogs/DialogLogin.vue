<template>
  <q-dialog :model-value="isOpen" @update:model-value="(value) => $emit('update:isOpen', value)"
    @show="usernameInput.focus()">
    <q-card style="min-width: 350px">
      <q-form class="q-gutter-md" @submit="onSubmit" @reset="onReset">
        <q-card-section>
          <q-input ref="usernameInput" v-model="username" filled label="Email Address"
            error-message="Email or Password is incorrect" :error="errorMessage != null">
            <template #prepend>
              <q-icon name="face" />
            </template>
          </q-input>
          <q-input v-model="password" filled label="Password" :type="isPwd ? 'password' : 'text'"
            error-message="Email or Password is incorrect" :error="errorMessage != null"
            autocomplete="current-password">
            <template #prepend>
              <q-icon name="password" />
            </template>
            <template #append>
              <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions v-if="errorMessage" vertical align="center">
          <div class="text-red q-mb-sm">
            {{ errorMessage }}
          </div>
          <q-btn v-if="errorCode === 'auth/wrong-password'"
            :label="isReset ? 'An email has been sent' : 'reset password?'" :loading="isResetting" :disabled="isReset"
            @click="onPasswordReset()">
            <template #fallback>
              <q-spinner-rings />
            </template>
          </q-btn>
        </q-card-actions>
        <q-card-actions v-if="!isLoggedIn" align="center">
          <q-btn type="reset" @click="$router.replace('/register')">
            Register
          </q-btn>
          <q-btn type="reset"> Cancel </q-btn>
          <q-btn type="submit" :loading="isSubmitting">
            <template #fallback> <q-spinner-rings /> </template>Log In
          </q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { useUserStore } from "stores/user";
import { auth } from "boot/firebase";
import { useRouter } from "vue-router";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

export default defineComponent({
  name: "DialogLogin",
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:isOpen"],
  setup(props, { emit }) {
    const $q = useQuasar();
    const username = ref(null);
    const usernameInput = ref(null);
    const password = ref(null);
    const isPwd = ref(true);
    const errorCode = ref(null);
    const errorMessage = ref(null);
    const isSubmitting = ref(false);
    const isResetting = ref(false);
    const isReset = ref(false);
    const router = useRouter();

    const userStore = useUserStore();
    const { isLoggedIn } = storeToRefs(userStore);

    const onSubmit = async () => {
      isSubmitting.value = true;
      errorMessage.value = null;
      errorCode.value = null;

      await signInWithEmailAndPassword(auth, username.value, password.value)
        .then(async (userCredential) => {
          const token = await userCredential.user.getIdTokenResult();
          const claims = token.claims;
          if (!claims.role) {
            // user has not been approved internally. show a dialog about the security
            $q.dialog({
              title: "Waiting on verification",
              message:
                "Thank you for setting up your account. We are working on setting everything up on our end.",
            });
          }

          $q.notify({
            color: "primary",
            message: `Welcome back ${userCredential.user.displayName}`,
            position: "top-right",
          });
          isSubmitting.value = false;

          setTimeout(() => {
            emit("update:isOpen", false);
          }, 1000);
        })
        .catch((error) => {
          console.error(error);
          errorMessage.value = error.message;
          errorCode.value = error.code;
          switch (error.code) {
            case "auth/invalid-email":
              errorMessage.value = "Invalid email";
              break;
            case "auth/user-not-found":
              errorMessage.value = "No account with that email was found.  Please click the register button below or contact us at 1-800-451-1515 to get started.";
              break;
            case "auth/wrong-password":
              errorMessage.value =
                "Welcome to Marathon's new website.  For security reasons, we are asking all users to reset their password.";
              break;
            /*case "auth/missing-password":
              errorMessage.value =
                "Welcome to Marathon's new website.  For security reasons, we are asking all users to reset their password.";
              break;*/
            default:
              errorMessage.value = "Email or password was incorrect";
              break;
          }
          isSubmitting.value = false;
        });
    };
    const onReset = () => {
      errorMessage.value = null;
      username.value = null;
      password.value = null;
      isSubmitting.value = false;
      emit("update:isOpen", false);
    };
    const onPasswordReset = async () => {
      isResetting.value = true;
      if (!username.value) {
        errorMessage.value =
          "An email address is required to reset the password";
      } else {
        await sendPasswordResetEmail(auth, username.value)
          .then(() => {
            isReset.value = true;
          })
          .catch((error) => {
            errorMessage.value =
              "There was a problem. Please contact the company directly";
          });
        isResetting.value = false;
      }
    };

    return {
      isLoggedIn,
      username,
      usernameInput,
      password,
      isPwd,
      onSubmit,
      isSubmitting,
      onPasswordReset,
      isResetting,
      isReset,
      onReset,
      errorCode,
      errorMessage,
    };
  },
});
</script>
