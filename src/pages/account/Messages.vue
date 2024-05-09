<template>
  <q-page padding>
    <q-btn
      icon="question_answer"
      label="Create a New Message"
      class="self-center"
    />
    <q-list>
      <q-item
        v-for="message in messages"
        :key="message"
        clickable
        :to="`/account/messages/${message.id}`"
      >
        <q-item-section>
          {{ message.date }}
        </q-item-section>
        <q-item-section>
          {{ message.subject }}
        </q-item-section>
        <q-item-section>
          <q-icon
            v-if="message.status == 'unread'"
            name="chat_bubble"
            color="green"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script>
import { onBeforeMount, computed } from "vue";
import { useStore } from "vuex";

const messageData = [
  {
    id: "asdfj12123",
    date: "2021-01-02",
    subject: "Question about GE311",
    status: "unread",
  },
  {
    id: "asdfj12123",
    date: "2020-12-23",
    subject: "Tracking # for Order 33123",
    status: "unread",
  },
  {
    id: "asdfj12123",
    date: "2020-11-21",
    subject: "Overdue Payment Request",
    status: "read",
  },
];
export default {
  setup() {
    const store = useStore();
    onBeforeMount(() => {
      store.dispatch("breadcrumbs/setBreadcrumbs", [
        { to: "/account", label: "Account" },
        { to: "/account/messages", label: "Messages" },
      ]);
    });

    const messages = computed(() => {
      return messageData;
    });
    return { messages };
  },
};
</script>
