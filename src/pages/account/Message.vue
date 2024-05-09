<template>
  <q-page padding>
    <div class="q-pa-md row justify-center">
      <div style="width: 100%; max-width: 400px">
        <q-chat-message
          v-for="message in messageData"
          :key="message"
          :name="message.user"
          :text="[message.text]"
          :stamp="message.time"
          :sent="message.user == 'me' ? true : false"
        />
        <q-input v-model="messageText" type="text" label="Your Message:">
          <template #after>
            <q-btn round dense flat icon="send" @click="addMessage" />
          </template>
        </q-input>
      </div>
    </div>
  </q-page>
</template>

<script>
import { onBeforeMount, computed, ref } from "vue";
import { useStore } from "vuex";

export default {
  setup() {
    const store = useStore();
    const messageText = ref(null);
    onBeforeMount(() => {
      store.dispatch("breadcrumbs/setBreadcrumbs", [
        { to: "/account", label: "Account" },
        { to: "/account/messages", label: "Messages" },
      ]);
    });
    let messageData = ref([
      {
        user: "me",
        time: "1 day ago",
        text: "Can you please tell me the size diamond for C1045?",
      },
      {
        user: "Sharon, Marathon",
        time: "8 hours ago",
        text: "No problem, it is .02ktw",
      },
      {
        user: "me",
        time: "4 minutes ago",
        text: "Perfect! Also, can you tell me if I have an overdue balance?",
      },
      {
        user: "Anna, Marathon",
        time: "2 minutes ago",
        text: "Everything is up to date.",
      },
    ]);
    const addMessage = () => {
      messageData.value.push({
        text: [messageText.value],
        time: "just now",
        user: "me",
      });
      console.log(messageData);
    };
    return { messageText, messageData, addMessage };
  },
};
</script>
