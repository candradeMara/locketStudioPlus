<template>
  <div class="row q-gutter-md align-center">
    <q-card class="contact-form q-pa-md col">
      <q-form class="q-gutter-md" @submit="onSubmit">
        <q-input v-model="formData.name" filled label="Name *" lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Required']" hide-bottom-space>
          <template #prepend>
            <q-icon name="perm_identity" />
          </template>
        </q-input>
        <q-input v-model="formData.email" filled type="email" label="Email Address"
          :rules="[(val) => (val && val.length > 0) || 'Required']" hide-bottom-space>
          <template #prepend>
            <q-icon name="mail" />
          </template>
        </q-input>
        <q-input v-model="formData.telephone" filled type="tel" label="Telephone Number" :error="null">
          <template #prepend>
            <q-icon name="phone" />
          </template>
        </q-input>
        <q-input v-model="formData.city" filled label="City">
          <template #prepend>
            <q-icon name="satellite" />
          </template>
        </q-input>
        <q-input v-model="formData.zipcode" filled label="Zipcode" :rules="[
        (val) => val.length == 0 || val.length == 5 || 'Invalid Zipcode',
      ]" hide-bottom-space>
          <template #prepend>
            <q-icon name="pin" />
          </template>
        </q-input>
        <q-input v-model="formData.inquiryReference" filled label="Order or Product Reference">
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-input v-model="formData.message" filled autogrow label="Your Message *"
          :rules="[(val) => (val && val.length > 0) || 'Required']" hide-bottom-space />
        <q-btn type="submit" :label="sendingStatus == 'sent' ? 'Sent' : 'Send'" :loading="sendingStatus === 'sending'"
          :disable="sendingStatus === 'sending' || sendingStatus === 'sent'" />
      </q-form>
    </q-card>
    <div class="contact-info col self-center">
      <p>
        Please use the contact form here to send us a message, but here are the
        other ways that you can get a hold of us if you need.
      </p>
      <p class="text-center">
        Telephone:
        <base-encoded-link link="tel:+1800451-1515" text="800-451-1515" /><br />
        Fax: 508-226-6272<br />
        Email:
        <base-encoded-link link="mailto:mail@marathon-co.com" text="mail@marathon-co.com" />
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

import { defineComponent, onBeforeMount, ref } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "stores/user";
import { getFunctions, httpsCallable } from "@firebase/functions";
import { useQuasar } from 'quasar';
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

    const $q = useQuasar();
    const userStore = useUserStore();
    const { isGuest } = storeToRefs(userStore);
    const functions = getFunctions();
    const sendContact = httpsCallable(functions, "callablesendcontact");
    const sendingStatus = ref("");
    const formData = ref({
      name: "",
      email: "",
      telephone: "",
      city: "",
      zipcode: "",
      inquiryReference: "",
      message: "",
    });
    onBeforeMount(() => {
      if (userStore.userData !== null && !isGuest) {
        formData.value.name = userStore.userData.name;
        formData.value.email = userStore.userData.email;
      }
    });
    const onSubmit = async () => {
      sendingStatus.value = "sending";

      // Get the user's IP address using an API service
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      const userIp = data.ip;

      // Get the user's browser information
      const browserInfo = `${navigator.userAgent} - ${navigator.platform}`;

      // Add the user's IP address and browser information to the formData object
      formData.value.ip = userIp;
      formData.value.browserInfo = browserInfo;

      // Call the sendContact function with the updated formData object
      //await sendContact(formData.value);
      sendingStatus.value = "sent";
      try {
        const response = await sendContact(formData.value);
        console.log("Email sent:", response);
        $q.notify({
          color: 'green',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'Email sent successfully!',
          position: 'top',
        });
      } catch (error) {
        console.error("Error sending email:", error);
        $q.notify({
          color: 'red',
          textColor: 'white',
          icon: 'error',
          message: 'Failed to send email!',
          position: 'top',
        });
      }
    };
    return {
      sendingStatus,
      formData,
      onSubmit,
    };
  },
});
</script>
