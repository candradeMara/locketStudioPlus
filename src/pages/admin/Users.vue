<template>
  <q-form @submit="onSubmit()">
    <q-input
      ref="searchInput"
      v-model="searchTerm"
      rounded
      outlined
      bottom-slots
      debounce="500"
      placeholder="Account, Email, or Username"
    >
      <template v-if="isFetching" #prepend>
        <q-spinner color="secondary" />
      </template>
      <template #append>
        <q-btn flat round type="submit" @click="onSubmit()">
          <q-icon name="search" />
        </q-btn>
      </template>
    </q-input>
  </q-form>
  <q-btn
    label="Add User"
    icon="person_add"
    size="lg"
    class="bg-white flex-center"
    @click="isAddUserOpen = true"
  />
  <dialog-add-user v-model:is-open="isAddUserOpen" :account="accountSearch" />
  <div v-if="accountSearch">
    <suspense>
      <user-list :key="accountSearch" :account="accountSearch" />
      <template #fallback>
        <q-spinner-grid color="primary" size="4rem" class="" />
      </template>
    </suspense>
  </div>
</template>

<script>
import { defineComponent, defineAsyncComponent, ref } from "vue";
import DialogAddUser from "src/components/dialogs/DialogAddUser.vue";
const UserList = defineAsyncComponent(() =>
  import("components/account/UserList.vue")
);
export default defineComponent({
  name: "AdminUsers",
  components: {
    DialogAddUser,
    UserList,
  },
  setup() {
    const isAddUserOpen = ref(false);
    const searchInput = ref(null);
    const searchTerm = ref("marathon");
    const isFetching = ref(false);
    const accountSearch = ref("marathon");
    const onSubmit = () => {
      accountSearch.value = searchTerm.value;
    };
    return {
      isAddUserOpen,
      searchInput,
      searchTerm,
      isFetching,
      accountSearch,
      onSubmit,
    };
  },
});
</script>
