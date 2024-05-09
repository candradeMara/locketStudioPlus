<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-sm-6 col">
      <user-card :user="userData" />
    </div>
    <div v-if="isBuyer" class="col-12 col-sm-6 col text-center">
      <div class="text-h6">Your Preferred Shipping Location:</div>
      <div v-if="userData.address_preferred" class="address q-mb-md">
        <div class="text-subtitle">{{ userData.address_preferred?.name }}</div>
        <div class="text-subtitle2">
          {{ userData.address_preferred?.line1 }}
        </div>
        <div class="text-subtitle2">
          {{ userData.address_preferred?.line2 }}
        </div>
        <div class="text-subtitle2">
          {{ userData.address_preferred.city }},
          {{ userData.address_preferred?.state }}
          {{ userData.address_preferred?.zipcode }}
        </div>
      </div>
      <q-btn
        :label="
          userData.address_preferred
            ? 'Change your preferred shipping address'
            : 'Set a preferred shipping address'
        "
        @click="isSelectAddressOpen = true"
      />
      <suspense v-if="isSelectAddressOpen">
        <address-list
          v-model:is-open="isSelectAddressOpen"
          v-model:selected="preferredAddress"
          :account="userData.account"
          class="col-6"
        />
        <template #fallback>
          <q-spinner-grid color="primary" size="4rem" class="" />
        </template>
      </suspense>
    </div>
  </div>
</template>

<script>
import { defineComponent, defineAsyncComponent, ref, watch } from "vue";
import { useAppStore } from "stores/app";
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia";
import { db } from "boot/firebase";
import { doc, setDoc } from "firebase/firestore";
import UserCard from "components/account/UserCard.vue";

const AddressList = defineAsyncComponent(() =>
  import("components/account/AddressList.vue")
);

export default defineComponent({
  name: "Profile",
  components: {
    UserCard,
    AddressList,
  },
  setup() {
    const appStore = useAppStore();
    appStore.breadcrumbs = [
      {
        label: "Account",
        path: "/account",
      },
      { label: "Profile", path: "/account/profile" },
    ];
    const userStore = useUserStore();
    const { userData, isBuyer } = storeToRefs(userStore);
    const preferredAddress = ref(userData.value.address_preferred);

    watch(preferredAddress, async (currentValue) => {
      await setDoc(
        doc(
          db,
          `accounts/${userData.value.account}/users/${userData.value.uid}`
        ),
        { address_preferred: { ...currentValue } },
        { merge: true }
      );
      isSelectAddressOpen.value = false;
    });
    const isSelectAddressOpen = ref(false);

    return { isBuyer, userData, preferredAddress, isSelectAddressOpen };
  },
});
</script>
