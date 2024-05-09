<template>
  <q-dialog
    :model-value="isOpen"
    @update:model-value="(value) => $emit('update:isOpen', value)"
  >
    <q-card class="q-pa-sm q-my-sm">
      <q-form>
        <q-card-section class="q-gutter-md">
          <q-input v-model="newUser.name" filled required label="Name">
            <template #prepend>
              <q-icon name="perm_identity" />
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
          <q-input
            v-model="newUser.phone"
            filled
            required
            type="tel"
            label="Phone Number"
            fill-mask
            mask="phone"
          >
            <template #prepend>
              <q-icon name="phone" />
            </template>
          </q-input>
          <div class="row justify-between">
            <q-toggle
              v-model="newUser.admin"
              checked-icon="check"
              color="green"
              label="Account Admin"
              unchecked-icon="clear"
            />
          </div>
        </q-card-section>
        <q-card-section>
          <div v-if="errorMessage" class="row text-center text-red">
            {{ errorMessage }}
          </div>
        </q-card-section>
        <q-card-actions class="justify-between">
          <q-btn
            icon="person_off"
            label="cancel"
            class="flex-end"
            @click="$emit('update:isOpen', false)"
          />
          <q-btn
            icon="person_add"
            :loading="isAdding"
            :label="isAdded ? 'Added' : 'Submit'"
            class="flex-end"
            @click="addUser()"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref } from "vue";
import { getFunctions, httpsCallable } from "@firebase/functions";

export default defineComponent({
  name: "AddUser",
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    account: {
      type: String,
      required: true,
    },
  },
  emits: ["update:isOpen", "addedUser"],
  setup(props, { emit }) {
    const errorMessage = ref(null);
    const newUser = ref({ email: "", name: "", phone: "", admin: false });
    const isAdding = ref(false);
    const isAdded = ref(false);
    const functions = getFunctions();
    const cloudCreateUser = httpsCallable(functions, "callableusercreate");

    const addUser = async () => {
      isAdding.value = true;
      const userInfo = {
        email: newUser.value.email,
        phone: newUser.value.phone,
        name: newUser.value.name,
        role: newUser.value.admin ? "account_admin" : "buyer",
        account: props.account,
      };
      await cloudCreateUser(userInfo)
        .then(async (response) => {
          isAdding.value = false;
          isAdded.value = true;
          newUser.value = { email: "", name: "", phone: "", admin: false };
          emit("addedUser", response);
          emit("update:isOpen", false);
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

    return {
      addUser,
      errorMessage,
      newUser,
      isAdding,
      isAdded,
    };
  },
});
</script>
