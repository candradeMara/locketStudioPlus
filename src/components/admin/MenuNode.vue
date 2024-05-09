<template>
  <container
    orientation="vertical"
    :group-name="`level-${level}`"
    class="menu q-pl-lg"
    @drop="onDrop"
    @drag-start="dragging = true"
    @drag-end="dragging = false"
  >
    <draggable
      v-for="(item, index) in items"
      :key="item.label"
      class="menu-item"
    >
      <q-expansion-item
        icon="drag_handle"
        switch-toggle-side
        :default-opened="item?.children?.length > 0 ? true : false"
        :expand-icon-class="level > 0 ? 'invisible' : ''"
        :class="{ 'no-hover': dragging }"
      >
        <template #header>
          <div class="row justify-around full-width">
            <div>
              {{ item.label }}
              <q-btn
                class="q-ml-sm"
                icon="edit"
                size="sm"
                flat
                round
                @click.prevent="editItem(item, index)"
              />
              <q-btn
                v-if="level < 1"
                icon="add_circle_outline"
                size="sm"
                flat
                round
                @click.prevent="addItem(item, index)"
              />
              <q-btn
                icon="delete"
                size="sm"
                flat
                round
                @click.prevent="deleteItem(item, index)"
              />
            </div>
            <div class="col text-right"><q-icon name="drag_handle" /></div>
          </div>
        </template>
        <menu-node
          v-if="item.children?.length > 0 && showChildren"
          v-model:items="item.children"
          :level="level + 1"
        />
      </q-expansion-item>
    </draggable>
  </container>
  <edit-menu-item
    v-model:isOpen="isEditMenuItemOpen"
    :menu-item="currentMenuItem"
    @update-item="updateItem"
  />
</template>

<script>
import { defineComponent, defineAsyncComponent, ref } from "vue";
import { Container, Draggable } from "vue3-smooth-dnd";

const EditMenuItem = defineAsyncComponent(() =>
  import("components/admin/EditMenuItem.vue")
);

export default defineComponent({
  name: "MenuNode",
  components: { Container, Draggable, EditMenuItem },
  props: {
    items: {
      type: Array,
      required: true,
    },
    level: {
      type: Number,
      default: 0,
    },
  },
  emits: ["update:items"],
  setup(props, { emit }) {
    const isEditMenuItemOpen = ref(false);
    const currentMenuItem = ref(null);
    const showChildren = ref(true);
    const dragging = ref(false);
    const onDrop = (dropResult) => {
      let tmpItems = [...props.items];
      const { removedIndex, addedIndex, payload } = dropResult;
      if (removedIndex === null && addedIndex === null) {
        return;
      }
      let itemToAdd = payload; // if we are dragging from somewhere else... ?
      if (removedIndex !== null) {
        itemToAdd = tmpItems.splice(removedIndex, 1)[0];
      }
      if (addedIndex !== null) {
        tmpItems.splice(addedIndex, 0, itemToAdd);
      }
      emit("update:items", tmpItems);
    };

    const updateItem = (item) => {
      console.log(item);
      let tmpItems = [...props.items];
      if (item.parentIndex !== undefined) {
        // we are adding to children.
        const parent = tmpItems[item.parentIndex];
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(item);
      } else if (item.index !== undefined) {
        // This is just an update.
        const index = item.index;
        delete item.index;
        tmpItems.splice(index, 1, item);
      }
      emit("update:items", tmpItems);
    };

    const addItem = (item, index) => {
      currentMenuItem.value = { parentIndex: index };

      isEditMenuItemOpen.value = true;
    };
    const editItem = (item, index) => {
      currentMenuItem.value = { ...item, index: index };
      console.log(currentMenuItem.value);
      isEditMenuItemOpen.value = true;
    };
    const deleteItem = (item, index) => {
      let tmpItems = [...props.items];
      tmpItems.splice(index, 1);
      emit("update:items", tmpItems);
    };

    return {
      isEditMenuItemOpen,
      currentMenuItem,
      dragging,
      onDrop,
      updateItem,
      deleteItem,
      addItem,
      editItem,
      showChildren,
    };
  },
});
</script>
<style lang="scss">
.menu-item {
  border-top: 1px solid $secondary;
}
.invisible {
  opacity: 0;
}
.no-hover:hover .q-focus-helper {
  background: inherit !important;
  opacity: 0 !important;
}
</style>
