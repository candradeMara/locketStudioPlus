<template>
  <q-header reveal bordered class="bg-orange-2 text-white" height-hint="98">
    <q-toolbar class="justify-center">
      <q-btn
        dense
        flat
        round
        icon="menu"
        class="mobile-only"
        @click="toggleLeft"
      />
      <router-link to="/">
        <img src="~assets/Home_HeaderImage.jpg" class="logo" />
      </router-link>
      <div class="actions">
        <q-btn
          flat
          round
          dense
          icon="search"
          class="desktop-only"
          @click="isSearchOpen = true"
        />
        <q-btn
          to="/account"
          flat
          round
          dense
          icon="person"
          class="desktop-only"
        />
        <q-btn
          to="/shop/cart"
          flat
          round
          dense
          icon="shopping_basket"
          class="desktop-only"
        />
      </div>
      <q-btn
        dense
        flat
        round
        icon="menu"
        class="mobile-only"
        @click="toggleRight"
      />
    </q-toolbar>
    <div class="menus" @mouseleave="secondaryTab = null">
      <q-tabs
        v-model="secondaryTab"
        class="desktop-only bg-primary text-dark header-menu"
      >
        <q-tab
          v-for="tab in menu"
          :key="tab"
          :name="tab.slug"
          :label="tab.label"
        />
      </q-tabs>
      <q-tab-panels
        v-model="secondaryTab"
        class="secondary-menu desktop-only bg-white text-dark"
      >
        <q-tab-panel
          v-for="tab in menu"
          :key="tab"
          class="row items-start text-dark justify-center"
          :name="tab.slug"
        >
          <template v-if="tab.collections">
            <div
              v-for="collection in tab.collections"
              :key="collection"
              class="col menu-list"
            >
              <router-link
                :to="`/${tab.slug}/${collection.slug}`"
                class="col item-header"
                >{{ collection.label }}</router-link
              >
              <q-separator />
              <router-link
                v-for="item in collection.items"
                :key="item"
                :to="`/${tab.slug}/${collection.slug}/${item.slug}`"
                >{{ item.label }}</router-link
              >
            </div>
          </template>
          <template v-else-if="tab.items">
            <div class="menu-list">
              <router-link
                v-for="item in tab.items"
                :key="item"
                :to="`/${tab.slug}/${item.slug}`"
                >{{ item.label }}</router-link
              >
            </div>
          </template>
        </q-tab-panel>
      </q-tab-panels>
      <q-dialog v-model="isSearchOpen">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">
              Product, Collection, Category, or Attribute
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input
              v-model="searchTerm"
              dense
              autofocus
              @keyup.enter="prompt = false"
            />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn v-close-popup flat label="Cancel" />
            <q-btn
              flat
              label="Search"
              @click="$router.push(`/shop/search/${searchTerm}`)"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-header>

  <q-drawer ref="leftDrawer" v-model="isLeftOpen" side="left" bordered>
    <q-list>
      <q-item-label header class="text-orange-7">
        {{ menu }}
      </q-item-label>
    </q-list>
  </q-drawer>

  <q-drawer ref="rightDrawer" v-model="isRightOpen" side="right" bordered>
    <q-list bordered>
      <q-item v-ripple to="/" exactclickable>
        <q-item-section avatar>
          <q-avatar color="teal" text-color="white" icon="home" />
        </q-item-section>
        <q-item-section>Home</q-item-section>
      </q-item>
      <q-item v-ripple to="/shop" exactclickable>
        <q-item-section avatar>
          <q-avatar color="teal" text-color="white" icon="add_shopping_cart" />
        </q-item-section>
        <q-item-section>Shop</q-item-section>
      </q-item>
      <q-item v-ripple to="/account" exactclickable>
        <q-item-section avatar>
          <q-avatar color="teal" text-color="white" icon="manage_accounts" />
        </q-item-section>
        <q-item-section>Account</q-item-section>
      </q-item>
    </q-list>
  </q-drawer>
</template>

<script>
// TODO: change from dropdown to accordian secondary menu and more styled content
import { computed, ref } from "vue";
import menuData from "assets/data/menu.json";

export default {
  setup() {
    const isLeftOpen = ref(false);
    const isRightOpen = ref(false);
    const isSecondaryOpen = ref(false);
    const isSearchOpen = ref(false);
    const searchTerm = ref(null);
    let secondaryTab = ref(null);
    const toggleLeft = function () {
      isLeftOpen.value = !isLeftOpen.value;
    };
    const toggleRight = function () {
      isRightOpen.value = !isRightOpen.value;
    };

    const menu = computed(() => {
      return menuData;
    });

    return {
      isSecondaryOpen,
      searchTerm,
      isSearchOpen,
      secondaryTab,
      isLeftOpen,
      isRightOpen,
      toggleLeft,
      toggleRight,
      menu,
    };
  },
};
</script>

<style lang="scss" scoped>
/* TODO: inline svg */
.logo path {
  fill: #fff;
}
.actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
}
.secondary-menu {
  font-size: 90%;
}
.item-header {
  font-size: 1.2rem;
  font-weight: 800;
}
.menu-list {
  padding-bottom: 1rem;
  padding-right: 1rem;
  text-align: left;
  a {
    border-bottom: 1px solid hsla(0, 0, 0, 0);
    color: $dark;
    display: block;
    text-decoration: none;
    transition: border 0.2s ease-out, background 0.2s ease-out;
    &:hover {
      background: hsla(0, 0, 0, 0.05);
      border-bottom: 1px solid $dark;
    }
  }
}
</style>
