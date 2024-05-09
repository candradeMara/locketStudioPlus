<template>
  <h4>Account: #{{ userData.account }}</h4>
  <h5>User: {{ userData.name }}</h5>
  <div class="row q-col-gutter-md account-cards">
    <div v-for="link in links" :key="link.name" class="col-12 col-sm-4">
      <q-card class="account-card full-height" @click="$router.push(link.path)">
        <q-card-section>
          <div class="text-h6">{{ link.name }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none text-center">{{
          link.description
        }}</q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "stores/app";
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia";

export default defineComponent({
  name: "AccountDashboard",
  setup() {
    const appStore = useAppStore();
    appStore.breadcrumbs = [{ label: "Account", path: "/account" }];
    const userStore = useUserStore();
    const router = useRouter();
    // if user is not a buyer, go straight to profile
    if (!userStore.isBuyer) {
      router.push("/account/profile");
    }
    const links = [
      {
        name: "Profile",
        path: "/account/profile",
        description: "Edit Your User Info",
      },
      {
        name: "Orders",
        path: "/account/orders",
        description: "View and track orders that you have placed.",
      },
      {
        name: "Favorites",
        path: "/account/favorites",
        description:
          "See all of your favorite itmes and manage your selections.",
      },
      {
        name: "Reorder",
        path: "/account/reorder",
        description: "View past purchases and easily reorder them.",
      },
      {
        name: "Image Download",
        path: "/account/images",
        description: "Download Images for previously shipped items.",
      },
    ];
    const { userData, isAccountAdmin, isAdmin } = storeToRefs(userStore);
    if (isAdmin) {
      links.push({
        name: "Admin Dashboard",
        path: "/admin/",
        description: "Admin Functions",
        requiresAdmin: true,
      });
    } else if (isAccountAdmin) {
      links.push({
        name: "User Management",
        path: "/account/management",
        description: "Add or edit registered users for your account.",
        requiresAdmin: true,
      });
    }

    return { links, userData };
  },
});
</script>

<style lang="scss" scoped>
.account-cards {
  visibility: hidden;
  & > * {
    transition: opacity 0.5s ease-out;
    visibility: visible;
  }
  &:hover > * {
    opacity: 0.5;
  }
  & > *:hover {
    opacity: 1;
  }
}
.account-card {
  border-radius: 0.25rem;
  box-shadow: $shadow-2;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.25s ease-out;
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
    text-shadow: 1px 1px 0px hsla(0deg, 0%, 0%, 0.5);
    &::before {
      background-color: $dark;
      height: 200%;
      width: 200%;
    }
  }
}
</style>
