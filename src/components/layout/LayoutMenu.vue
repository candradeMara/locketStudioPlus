<template>
  <div
    class="menus gt-sm full-width"
    style="position: relative; z-index: 1500"
    @mouseleave="startMenuTimer()"
    @mouseenter="endMenuTimer()"
  >
    <q-tabs
      v-model="secondaryTab"
      dense
      class="bg-primary text-dark header-menu"
    >
      <q-tab v-show="isLoggedIn" name="products" label="Products" />
      <q-tab
        v-for="tab in getMenu"
        v-show="
          (!tab.requiresAuth || isLoggedIn) &&
          (!tab.requiresAdmin || isAccountAdmin)
        "
        :key="tab"
        :name="tab.label"
        :label="tab.label"
        @click.prevent="go(tab)"
      />
      <q-tab
        v-if="isLoggedIn"
        name="search"
        label="Search"
        @click="isSearchOpen = true"
      />
      <dialog-search v-model:is-open="isSearchOpen" />
      <q-tab
        v-if="isLoggedIn"
        name="logout"
        label="Log Out"
        @click="logout($route)"
      />
      <q-tab v-else name="login" label="Log In" @click="isLoginOpen = true" />
    </q-tabs>
    <q-tab-panels
      v-model="secondaryTab"
      animated
      class="secondary-menu bg-white text-dark dropdown-menu"
      transition-next="fade"
      transition-previous="fade"
    >
      <q-tab-panel name="products" class="menu row">
        <div
          v-for="collection in getCollectionsArray"
          :key="collection"
          class="col submenu"
        >
          <router-link
            :to="`${collection.path}`"
            class="col item-header"
            @click="secondaryTab = null"
          >
            {{ collection.label }}
          </router-link>
          <q-separator />
          <router-link
            v-for="category in collection.children"
            :key="category"
            :to="`${category.filterPath}`"
            @click="secondaryTab = null"
          >
            {{ category.label }}
          </router-link>
        </div>
      </q-tab-panel>
      <q-tab-panel
        v-for="tab in getMenu"
        :key="tab"
        class="row items-start text-dark justify-center"
        :name="tab.label"
      >
        <div v-if="tab.children" class="menu">
          <template v-for="child in tab.children" :key="child">
            <component
              :is="child.to ? 'a' : 'router-link'"
              :href="child.to"
              :to="`${child.path}`"
              :target="child.to ? '_blank ' : ''"
              @click="secondaryTab = null"
            >
              {{ child.label }}
            </component>
          </template>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
  <dialog-login v-model:is-open="isLoginOpen" />
</template>

<script>
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "stores/app";
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia";
import { logout } from "src/utilities/auth";
import DialogLogin from "components/dialogs/DialogLogin.vue";
import DialogSearch from "components/dialogs/DialogSearch.vue";

export default defineComponent({
  name: "LayoutMenu",
  components: {
    DialogLogin,
    DialogSearch,
  },
  async setup() {
    let menuTimer = null;
    const isLoginOpen = ref(false);
    const isSearchOpen = ref(false);
    const router = useRouter();
    const appStore = useAppStore();
    const { getCollectionsArray, getMenu } = storeToRefs(appStore);
    const userStore = useUserStore();
    const { isLoggedIn, isAccountAdmin } = storeToRefs(userStore);
    const secondaryTab = ref(null);


    const go = (item) => {
      if (item.to) {

        window.location.href = item.to;
      } else if (item.path) {
        if (!item.path.startsWith("/")) {
          // add leading slash if it's missing
          item.path = `/${item.path}`;
        }
        router.push(item.path);
      } else {
        secondaryTab.value = item.label;
      }
    };
    const startMenuTimer = () => {
      clearTimeout(menuTimer);
      menuTimer = setTimeout(() => {
        secondaryTab.value = null;
      }, 500);
    };
    const endMenuTimer = () => {
      clearTimeout(menuTimer);
    };

    return {
      isLoggedIn,
      isLoginOpen,
      isSearchOpen,
      isAccountAdmin,
      getMenu,
      getCollectionsArray,
      logout,
      secondaryTab,
      menuTimer,
      startMenuTimer,
      endMenuTimer,
      go,
    };
  },
});
</script>
<style lang="scss" scoped>
.secondary-menu {
  font-size: 90%;
}
.item-header {
  font-size: 1.2rem;
  font-weight: 800;
}
.menu {
  a {
    border-bottom: 1px solid hsla(0deg, 0%, 0%, 0);
    color: $dark;
    cursor: pointer;
    display: block;
    text-align: center;
    text-decoration: none;
    transition: border 0.2s ease-out, background 0.2s ease-out;
    &:hover {
      background: hsla(0deg, 0%, 0%, 0.05);
      border-bottom: 1px solid $dark;
    }
  }
}
.submenu {
  padding-bottom: 1rem;
  padding-right: 1rem;
  text-align: center;
}
.dropdown-menu {
  position: absolute;
  width: 100%;
  box-shadow: rgba(0, 0, 0, 0.5) 0px 25px 20px -20px;
}
</style>
