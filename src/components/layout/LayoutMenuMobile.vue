<template>
  <q-drawer
    :model-value="isOpen"
    elevated
    overlay
    :side="side"
    class="text-dark"
    @update:model-value="(value) => $emit('update:isOpen', value)"
  >
    <q-scroll-area class="fit">
      <q-list padding class="menu-list">
        <q-item v-if="back.length > 0" v-ripple clickable @click="goBack()">
          Back
        </q-item>
        <transition
          v-for="item in menuItems"
          v-show="
            (!item.requiresAuth || isLoggedIn) &&
            (!item.requiresAdmin || isAdmin)
          "
          :key="item"
          appear
          enter-active-class="animated backInRight"
          leave-active-class="animated backOutLeft"
          mode="in-out"
        >
          <q-item
            v-ripple
            clickable
            @click="item.children ? setMenuItems(item) : go(item)"
          >
            {{ item.label }}
          </q-item>
        </transition>
        <transition
          v-if="back.length == 0"
          appear
          enter-active-class="animated backInRight"
          leave-active-class="animated backOutLeft"
          mode="in-out"
        >
          <q-item v-if="isLoggedIn" v-ripple clickable @click="logout($route)"
            >Log Out</q-item
          >
        </transition>
        <transition
          v-if="back.length == 0"
          appear
          enter-active-class="animated backInRight"
          leave-active-class="animated backOutLeft"
          mode="in-out"
        >
          <q-item
            v-if="!isLoggedIn"
            v-ripple
            clickable
            @click="isLoginOpen = true"
            >Log In</q-item
          >
        </transition>
      </q-list>
    </q-scroll-area>
  </q-drawer>
  <dialog-login v-model:is-open="isLoginOpen" />
</template>

<script>
import { defineComponent, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "stores/app";
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia";
import { logout } from "src/utilities/auth";
import DialogLogin from "components/dialogs/DialogLogin.vue";

export default defineComponent({
  name: "LayoutMenuMobile",
  components: {
    DialogLogin,
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    side: {
      type: String,
      default: "right",
    },
  },
  emits: ["update:isOpen"],
  async setup() {
    const router = useRouter();

    const appStore = useAppStore();
    const userStore = useUserStore();
    const { isLoggedIn, isAccountAdmin } = storeToRefs(userStore);

    const isLoginOpen = ref(false);
    const productCollections = {
      label: "Products",
      requiresAuth: true,
      path: "products",
      children: appStore.getCollectionsArray,
    };
    // convert menu from array to nested objects?
    const menuItems = ref([productCollections, ...appStore.getMenu]);
    const back = ref([]);

    const goBack = () => {
      menuItems.value = back.value.pop();
    };
    const go = (item) => {
      if (item.to) {
        window.location.href = item.to;
      } else {
        if (!item.path.startsWith("/")) {
          // add leading slash if it's missing
          item.path = `/${item.path}`;
        }
        router.push(item.path);
      }
    };
    const setMenuItems = (menuItem) => {
      // push old menu to 'back button'
      back.value.push(menuItems.value);
      // const subItems = menuItem.children.filter((item) => item.children);
      // if this item has a path include that link as "view All"
      if (!Array.isArray(menuItem.children)) {
        // convert children from object to array
        menuItem.children = Object.values(menuItem.children);
      }
      if (menuItem.path) {
        menuItems.value = [...menuItem.children];
        menuItems.value.unshift({
          path: menuItem.path,
          label: "View All",
        });
      } else if (menuItem.children) {
        menuItems.value = menuItem.children;
      }
    };
    return {
      isLoggedIn,
      isAccountAdmin,
      goBack,
      back,
      go,
      isLoginOpen,
      logout,
      menuItems,
      setMenuItems,
    };
  },
});
</script>
