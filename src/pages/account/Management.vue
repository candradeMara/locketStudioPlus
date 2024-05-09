<template>
  <div class="row q-col-gutter-sm justify-center">
    <div class="col-md-6 q-gutter-md text-center">
      <q-btn
        label="Add User"
        icon="person_add"
        size="lg"
        class="bg-white flex-center"
        @click="isAddUserOpen = true"
      />
      <dialog-add-user
        v-model:is-open="isAddUserOpen"
        :account="userData.account"
      />
      <suspense>
        <user-list :account="userData.account" />
        <template #fallback>
          <q-spinner-grid color="primary" size="4rem" class="" />
        </template>
      </suspense>
    </div>
    <div class="col-md-6 q-gutter-md">
      <suspense>
        <address-list :account="userData.account" />
        <template #fallback>
          <q-spinner-grid color="primary" size="4rem" class="" />
        </template>
      </suspense>
    </div>
  </div>
</template>

<script>
import { defineComponent, defineAsyncComponent, ref } from "vue";
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia";
import DialogAddUser from "src/components/dialogs/DialogAddUser.vue";

const AddressList = defineAsyncComponent(() =>
  import("components/account/AddressList.vue")
);
const UserList = defineAsyncComponent(() =>
  import("components/account/UserList.vue")
);

export default defineComponent({
  name: "UserManagement",
  components: { AddressList, UserList, DialogAddUser },
  setup() {
    const appStore = useAppStore();
    appStore.breadcrumbs = [
      {
        label: "Account",
        path: "/account",
      },
      { label: "Account Management", path: "/account/management" },
    ];
    const isAddUserOpen = ref(false);
    const userStore = useUserStore();
    const { userData } = storeToRefs(userStore);
    return { isAddUserOpen, userData };
  },
});
</script>
