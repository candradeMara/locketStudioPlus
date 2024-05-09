<template>
  <div v-if="menuData === null">
    <q-spinner />
  </div>
  <div v-else>
    <div class="q-pl-lg">
      <q-separator />
      <q-expansion-item
        switch-toggle-side
        disabled
        label="Products (Cannot be edited)"
        :default-opened="false"
        expand-icon-class="invisible"
        class="no-hover"
      />
    </div>
    <div class="q-pl-lg">
      <q-separator />
      <q-expansion-item
        switch-toggle-side
        label="Add New Menu"
        :default-opened="false"
        expand-icon-class="invisible"
        class="no-hover"
        @click="isEditMenuItemOpen = true"
      />
    </div>
    <menu-node v-if="menuData.length > 0" v-model:items="menuData" />
    <div class="q-pl-lg">
      <q-separator />
      <q-expansion-item
        switch-toggle-side
        label="Add New Menu"
        :default-opened="false"
        expand-icon-class="invisible"
        class="no-hover"
        @click="isEditMenuItemOpen = true"
      />
    </div>
    <div class="q-pl-lg">
      <q-separator />
      <q-expansion-item
        switch-toggle-side
        disabled
        label="Login/Logout (Cannot be edited)"
        :default-opened="false"
        expand-icon-class="invisible"
        class="no-hover"
      >
      </q-expansion-item>
    </div>
    <edit-menu-item
      :key="menuData"
      v-model:isOpen="isEditMenuItemOpen"
      @update-item="addMenu"
    />
  </div>
</template>

<script>
import {
  defineAsyncComponent,
  defineComponent,
  onBeforeMount,
  onBeforeUnmount,
  ref,
  watch,
} from "vue";
import { db } from "boot/firebase";
import { doc, onSnapshot, setDoc } from "@firebase/firestore";
import MenuNode from "components/admin/MenuNode.vue";

const EditMenuItem = defineAsyncComponent(() =>
  import("components/admin/EditMenuItem.vue")
);

export default defineComponent({
  name: "AdminMenu",
  components: { EditMenuItem, MenuNode },
  setup() {
    const menuData = ref(null);
    const isEditMenuItemOpen = ref(false);
    let snapshotListenerUnsubscribe = null;
    onBeforeMount(async () => {
      snapshotListenerUnsubscribe = onSnapshot(
        doc(db, "app/default"),
        (doc) => {
          const menu = doc.data()?.menu;
          if (Array.isArray(menu) && menu.length > 0) {
            menuData.value = [...menu];
          } else {
            menuData.value = [];
          }
        }
      );
    });
    onBeforeUnmount(() => {
      if (snapshotListenerUnsubscribe !== null) {
        snapshotListenerUnsubscribe();
      }
    });
    watch(
      menuData,
      async (currentValue, previousValue) => {
        await setDoc(
          doc(db, "app/default"),
          { menu: currentValue },
          { merge: true }
        );
      },
      { deep: true }
    );

    const addMenu = async (menu) => {
      menuData.value.push(menu);
      await setDoc(
        doc(db, "app/default"),
        { menu: menuData.value },
        { merge: true }
      );
    };
    return { menuData, isEditMenuItemOpen, addMenu };
  },
});
</script>
<style>
.invisible {
  opacity: 0;
}
.no-hover:hover .q-focus-helper {
  background: inherit !important;
  opacity: 0 !important;
}
</style>
