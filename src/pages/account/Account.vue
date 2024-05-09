<template>
  <q-page padding>
    <div class="q-pa-md row items-start q-gutter-md account-cards">
      <q-card
        v-ripple
        class="account-card"
        @click="$router.push('/account/messages')"
      >
        <q-card-section>
          <div class="text-h6">My Messages</div>
          <div class="text-subtitle2">(2 unread)</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          View your messages or send us a new one.
        </q-card-section>
      </q-card>
      <q-card
        v-ripple
        class="account-card"
        @click="$router.push('/account/profile')"
      >
        <q-card-section>
          <div class="text-h6">My Profile</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          View Shipping Addresses, Billing Info, User Info, and more.
        </q-card-section>
      </q-card>
      <q-card
        v-ripple
        class="account-card"
        @click="$router.push('/account/orders')"
      >
        <q-card-section>
          <div class="text-h6">My Orders</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          View and track orders that you have placed.
        </q-card-section>
      </q-card>
      <q-card
        v-ripple
        class="account-card"
        @click="$router.push('/account/favorites')"
      >
        <q-card-section>
          <div class="text-h6">My Favorites</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          See all of your favorite itmes and manage your selections.
        </q-card-section>
      </q-card>
      <q-card
        v-ripple
        class="account-card"
        @click="$router.push('/account/reorder')"
      >
        <q-card-section>
          <div class="text-h6">Reorder</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          View past purchases and easily reorder them.
        </q-card-section>
      </q-card>
      <q-card
        v-ripple
        class="account-card"
        @click="$router.push('/account/management')"
      >
        <q-card-section>
          <div class="text-h6">Account Management</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          Add or edit registered users for your account.
        </q-card-section>
      </q-card>
      <q-card
        v-ripple
        class="account-card"
        @click="$router.push('/account/account-orders')"
      >
        <q-card-section>
          <div class="text-h6">Account Orders</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          View and track all orders for the account.
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { onBeforeMount } from "vue";
import { useStore } from "vuex";
export default {
  setup() {
    const store = useStore();
    onBeforeMount(() => {
      store.dispatch("breadcrumbs/setBreadcrumbs", [
        { to: "/account", label: "Account" },
      ]);
    });
    return {};
  },
};
</script>
<style lang="scss" scoped>
.account-cards {
  visibility: hidden;
  & > * {
    visibility: visible;
  }
  &:hover > * {
    opacity: 0.5;
  }
}
.account-card {
  border-radius: 0.25rem;
  box-shadow: $shadow-2;
  cursor: pointer;
  max-width: 250px;
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.25s ease-out, opacity 0.5s ease-out;
  width: 100%;
  z-index: 0;
  &::after {
    $size: 20px;
    color: #fff;
    content: "➔";
    height: $size;
    position: absolute;
    top: 5px;
    right: 5px;
    width: $size;
    z-index: 1;
  }
  &::before {
    $size: 40px;
    background: $primary;
    border-radius: $size;
    content: "";
    height: $size * 2;
    position: absolute;
    top: -1 * $size;
    right: -1 * $size;
    transition: width 0.5s ease-out, height 0.5s ease-out,
      background-color 0.5s ease-out;
    width: $size * 2;
    z-index: -1;
  }
  &:hover {
    box-shadow: $shadow-8;
    color: #fff;
    opacity: 1;
    text-shadow: 1px 1px 0px hsla(0, 0, 0, 0.5);
    &::before {
      background-color: $dark;
      height: 200%;
      width: 200%;
    }
  }
}
</style>
