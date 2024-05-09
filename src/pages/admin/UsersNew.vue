<template>
  <ul>
    <li v-for="user of users" :key="user.uid">
      <q-btn label="verifiy" @click="verifyUser(user)" />
      {{ user.email }} - {{ user.verified ? "verified" : "NOT verified" }}
    </li>
  </ul>
</template>
<script>
import { defineComponent, onBeforeMount, ref } from "vue";
import { db } from "boot/firebase";
import { collection, getDocs, doc, updateDoc } from "@firebase/firestore";

export default defineComponent({
  setup() {
    const users = ref([]);
    onBeforeMount(async () => {
      console.log("fetching now");
      const querySnapshot = await getDocs(collection(db, "_new_users"));
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
        users.value.push(doc.data());
      });
    });

    const verifyUser = async (user) => {
      console.log(user.uid);
      const userRef = doc(db, "_new_users", user.uid);
      await updateDoc(userRef, { verified: true })
        .then(() => {
          console.log("updated");
        })
        .catch((error) => {
          console.error(error);
        });
    };

    return { users, verifyUser };
  },
});
</script>
