<template>
  <div class="row q-gutter-md align-center">
    <q-card v-if="isAdded" class="q-pa-lg text-center">
      <p>
        You have been registered. You should receive an email verification
        request.
      </p>
      <p>
        Your account will be restricted until we verify your information and
        finish setting everything up on our end.
      </p>
      <p>
        If you haven't received an email after 24 hours, please contact us
        directly.
      </p>
    </q-card>
    <q-card v-else class="contact-form q-pa-md col">
      <q-form class="q-gutter-md" @submit="onSubmit">
        <q-card-section class="q-gutter-md">
          <q-input v-model="newUser.name" filled required label="Name">
            <template #prepend>
              <q-icon name="perm_identity" />
            </template>
          </q-input>
          <q-input
            v-model="newUser.account"
            filled
            required
            type="text"
            label="Account Number"
          >
            <template #prepend>
              <q-icon name="tag" />
            </template>
          </q-input>
          <q-input
            v-model="newUser.business"
            filled
            required
            type="text"
            label="Business Name"
          >
            <template #prepend>
              <q-icon name="store" />
            </template>
          </q-input>
          <q-input
            v-model="newUser.email"
            filled
            required
            type="email"
            label="Email Address"
          >
            <template #prepend>
              <q-icon name="email" />
            </template>
          </q-input>
        </q-card-section>
        <q-card-section v-if="errorMessage">
          <p>That email address may already be registered.</p>
          <p>Have you tried resetting your password instead?</p>
          <q-btn
            v-if="errorMessage"
            :label="isReset ? 'An email has been sent' : 'reset password?'"
            :loading="isResetting"
            :disabled="isReset"
            @click="onPasswordReset()"
          >
            <template #fallback>
              <q-spinner-rings />
            </template>
          </q-btn>
        </q-card-section>
        <q-card-actions class="justify-between">
          <q-btn
            type="submit"
            label="Register"
            :loading="isAdding"
            :disable="isAdding"
          />
        </q-card-actions>
      </q-form>
    </q-card>
    <div class="contact-info col self-center">
      <p>
        If you haven't set up an account with us yet, please contact us
        directly.
      </p>
      <p class="text-center">
        Telephone:
        <base-encoded-link link="tel:+1800451-1515" text="800-451-1515" /><br />
        Fax: 508-226-6272<br />
        Email:
        <base-encoded-link
          link="mailto:mail@marathon-co.com"
          text="mail@marathon-co.com"
        />
        <br />
        Marathon Company<br />
        PO Box 419/90 O’Neil Blvd.<br />
        Attleboro, MA 02703 USA
      </p>
    </div>
  </div>
</template>

<script>
// TODO: make better message sent message...
// TODO: check browser info

import { defineComponent, ref } from "vue";
import { getFunctions, httpsCallable } from "@firebase/functions";
import { auth } from "boot/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import BaseEncodedLink from "components/base/BaseEncodedLink.vue";

export default defineComponent({
  name: "Contact",
  components: {
    BaseEncodedLink,
  },
  props: {
    type: {
      type: String,
      default: "default",
    },
  },
  setup() {
    const errorMessage = ref(null);
    const newUser = ref({
      email: "",
      name: "",
      phone: "",
      account: "",
      business: "",
    });
    const isAdding = ref(false);
    const isAdded = ref(false);
    const functions = getFunctions();
    const cloudCreateUser = httpsCallable(functions, "callableusercreate");
    const onSubmit = async () => {
      isAdding.value = true;
      const userInfo = {
        email: newUser.value.email,
        name: newUser.value.name,
        account: newUser.value.account,
      };
      await cloudCreateUser(userInfo)
        .then(async (response) => {
          isAdding.value = false;
          isAdded.value = true;
          newUser.value = {
            email: "",
            name: "",
            account: "",
            business: "",
          };
        })
        .catch((error) => {
          console.error(error);
          console.error("code", error?.code);
          switch (error.code) {
            case "auth/invalid-email":
              error.message.value = "Invalid email";
              break;
            case "auth/user-not-found":
              errorMessage.value = "No account with that email was found";
              break;
            case "auth/wrong-password":
              errorMessage.value = "Incorrect password";
              break;
            default:
              errorMessage.value = error?.message
                ? error.message
                : "There was a problem";
              break;
          }
          isAdding.value = false;
        });
    };
    const isResetting = ref(false);
    const isReset = ref(false);
    const onPasswordReset = async () => {
      isResetting.value = true;
      if (!newUser.value.email) {
        errorMessage.value =
          "An email address is required to reset the password";
      } else {
        await sendPasswordResetEmail(auth, newUser.value.email)
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
      onSubmit,
      errorMessage,
      newUser,
      isAdding,
      isAdded,
      onPasswordReset,
      isResetting,
      isReset,
    };
  },
});
</script>
