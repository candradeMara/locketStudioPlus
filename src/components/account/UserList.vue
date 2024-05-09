<template>
  <q-list>
    <q-item-label header>Registered Users</q-item-label>
    <q-item v-for="user in users" :key="user">
      <user-card :user="user" />
    </q-item>
  </q-list>
</template>

<script>
import { onBeforeMount, onBeforeUnmount, ref } from "vue";
import { db } from "boot/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import UserCard from "components/account/UserCard.vue";

export default {
  name: "UserList",
  components: {
    UserCard,
  },
  props: {
    account: {
      type: String,
      required: true,
    },
  },
  async setup(props) {
    const users = ref([]);
    const usersCollection = collection(db, `accounts/${props.account}/users`);
    let unsubscribe = null;
    onBeforeMount(async () => {
      unsubscribe = onSnapshot(usersCollection, (querySnap) => {
        users.value = [];
        querySnap.forEach((doc) => {
          users.value.push({ ...doc.data() });
        });
      });
    });
    onBeforeUnmount(async () => {
      unsubscribe();
    });
    return { users };
  },
};
</script>
