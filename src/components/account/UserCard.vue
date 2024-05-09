<template>
  <q-card class="col q-pa-md rounded" :class="isCurrentUser ? 'bg-grey-1' : ''">
    <q-form class="user-form q-gutter-md" @submit="updateUser">
      <q-input v-model="inputUser.name" filled label="Name" class="col">
        <template #prepend>
          <q-icon name="perm_identity" />
        </template>
      </q-input>
      <q-input
        v-model="inputUser.email"
        filled
        type="email"
        label="Email Address"
      >
        <template #prepend>
          <q-icon name="email" />
        </template>
      </q-input>
      <q-input
        v-model="inputUser.phone"
        filled
        type="tel"
        label="Phone Number"
        fill-mask
        mask="phone"
      >
        <template #prepend>
          <q-icon name="phone" />
        </template>
      </q-input>
      <q-toggle
        v-model="isUserAdmin"
        :disable="isCurrentUser"
        checked-icon="check"
        color="green"
        label="Account Admin"
        unchecked-icon="clear"
      />
      <q-card-actions align="evenly" class="q-gutter-md">
        <q-btn
          :label="isResetSent ? 'Email Sent' : 'Reset Password'"
          :icon="isResetSent ? 'check_circle' : 'password'"
          class="bg-white"
          :loading="isResetSending"
          @click="passwordReset"
        />
        <q-btn
          type="submit"
          :label="isUserUpdating ? 'Success!' : 'Save User'"
          :loading="isUserUpdating"
          :icon="isUserUpdated ? 'check_circle' : 'info'"
          :class="isUserUpdated ? 'bg-green' : 'bg-white'"
        >
          <template #fallback>
            <q-spinner-dots />
          </template>
        </q-btn>
        <q-btn
          icon="person_off"
          label="Delete User"
          :disabled="isCurrentUser"
          @click="deleteUser()"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script>
import { defineComponent, onErrorCaptured, ref } from "vue";
import { useUserStore } from "stores/user";
import { getFunctions, httpsCallable } from "@firebase/functions";
import { auth, db } from "boot/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";

function isValidEmail(val) {
  const emailPattern =
    /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return emailPattern.test(val) || false;
}

export default defineComponent({
  name: "UserCard",
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  emits: ["deleteUser"],
  setup(props, { emit }) {
    const userStore = useUserStore();
    const isCurrentUser = ref(props.user.uid === userStore.userData.uid);
    const isUserUpdating = ref(false);
    const isUserUpdated = ref(false);
    const inputUser = ref({ ...props.user });
    const isUserAdmin = ref(props.user.role === "account_admin");
    const isResetSending = ref(false);
    const isResetSent = ref(false);
    // using cloudFunctions for updating/deleting because we also are updating/deleting the firebase.auth user.
    const functions = getFunctions();
    const cloudUpdateUser = httpsCallable(functions, "callableuserupdate");
    // const cloudDeleteUser = httpsCallable(functions, "callableuserdelete");

    const updateUser = async () => {
      isUserUpdating.value = true;
      if (isValidEmail(inputUser.value.email)) {
        await cloudUpdateUser({
          ...inputUser.value,
          role: isUserAdmin.value ? "account_admin" : "buyer",
        })
          .then((response) => {
            console.log(response);
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        console.log("cannot find account info for this currentUser...");
      }
      isUserUpdating.value = false;
    };
    const deleteUser = async () => {
      // delete the firestore doc, firestore cloud function will trigger deleting the auth user.
      const { account, uid } = props.user;
      await deleteDoc(doc(db, `accounts/${account}/users/${uid}`))
        .then(() => {
          emit("deleteUser", uid);
        })
        .catch((error) => {
          console.error(error);
        });
    };

    const passwordReset = async () => {
      isResetSending.value = true;
      await sendPasswordResetEmail(auth, props.user.email)
        .then((response) => {
          isResetSending.value = false;
          isResetSent.value = true;
        })
        .catch((error) => {
          console.error(error);
        });
    };
    onErrorCaptured((error) => {
      if (error) {
        console.error(error);
        return false;
      }
      return true;
    });

    return {
      isCurrentUser,
      inputUser,
      isUserAdmin,
      isUserUpdating,
      isUserUpdated,
      isResetSending,
      isResetSent,
      updateUser,
      deleteUser,
      passwordReset,
    };
  },
});
</script>
