<template>
  <q-scroll-observer axis="vertical" @scroll="onScroll" />
  <q-header id="header" class="text-white bg-dark" height-hint="50">
    <q-toolbar class="toolbar justify-center bg-dark" :class="{
    scrolled: scrollPositionY >= 220 || $q.screen.lt.md,
    intermediate: scrollPositionY > 50 && scrollPositionY < 220,
  }">
      <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
        <router-link v-show="scrollPositionY > 120 || showLogo || $q.screen.lt.md" to="/"
          style="max-height: 50px; display: flex; align-items: center">
          <img src="~assets/img/logo-small.svg" class="logo" style="max-width: calc(100vw - 180px)" />
        </router-link>
      </transition>
      <q-space />
      <div class="actions">
        <q-btn v-if="isLoggedIn" flat round dense icon="search" @click="isSearchOpen = true">
          <q-tooltip> Search </q-tooltip>
        </q-btn>
        <dialog-search v-model:is-open="isSearchOpen" />
        <q-btn v-if="isLoggedIn && !isGuest" to="/account" flat dense icon="person"
          :label="$q.screen.gt.sm ? userData.name : ''">
          <q-tooltip>
            <div class="column text-center">
              <span>Manage Account</span>
              <span>#{{ userData.account }}</span>
              <span>{{ userData.name }}</span>
            </div>
          </q-tooltip>
        </q-btn>
        <button-cart v-if="isBuyer" />
        <q-btn dense flat round icon="menu" class="lt-md self-start" @click="isMenuOpen = true" />
      </div>
    </q-toolbar>
  </q-header>
  <Suspense v-if="$q.screen.lt.md">
    <layout-menu-mobile v-model:is-open="isMenuOpen" />
  </Suspense>
</template>

<script>
// TODO: make tooltips into menus instead (add a logout link to userData...)
import { defineComponent, defineAsyncComponent, ref } from "vue";
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia";
import ButtonCart from "components/buttons/ButtonCart.vue";
import DialogSearch from "components/dialogs/DialogSearch.vue";


const LayoutMenuMobile = defineAsyncComponent(() =>
  import("components/layout/LayoutMenuMobile.vue")
);


export default defineComponent({
  name: "LayoutHeader",
  components: { ButtonCart, LayoutMenuMobile, DialogSearch },
  props: {
    showLogo: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const userStore = useUserStore();
    const { userData, isLoggedIn, isBuyer, isGuest } = storeToRefs(userStore);
    const isSearchOpen = ref(false);
    const isMenuOpen = ref(false);
    const scrollPositionY = ref(0);
    const onScroll = (info) => {
      scrollPositionY.value = info.position.top;
    };
    return {
      isSearchOpen,
      isLoggedIn,
      isBuyer,
      isGuest,
      isMenuOpen,
      userData,
      scrollPositionY,
      onScroll,
    };
  },
});
</script>
<style lang="scss">
#header {
  height: 50px;
}

.toolbar {
  margin: 0;
  opacity: 1;
  padding: 0 1rem;
  position: absolute;
  width: 100%;
  z-index: 2000;
  transition: opacity 0s ease-in;

  .logo {
    opacity: 0;
  }

  &.intermediate {
    opacity: 0;
    position: fixed;

    // transition: opacity 0.5s ease-in;
    .logo {
      opacity: 1;
    }
  }

  &.scrolled {
    opacity: 1;
    position: fixed;
    transition: opacity 2s ease-in;

    .logo {
      opacity: 1;
    }
  }

  .actions {
    border-radius: 1rem 0 0 1rem;
  }

  .logo path {
    fill: #fff;
  }
}

.logos .div1,
.logos .div2,
.logos .div3,
.logos .div4,
.logos .div5,
.logos .div6,
.logos .div7,
.logos .div8 {
  transform: scale(0.7);
  margin: 0;
  /* Remove margin */
  padding: 0;
}
</style>
