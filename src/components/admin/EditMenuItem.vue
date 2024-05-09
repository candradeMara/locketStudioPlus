<template>
  <q-dialog
    :model-value="isOpen"
    @update:model-value="(value) => $emit('update:isOpen', value)"
  >
    <q-card style="min-width: 350px">
      <q-form @submit="onSubmit" @reset="onReset">
        <q-card-section>
          <q-input
            v-model="menuItemData.label"
            type="text"
            label="Label"
            bottom-slots
          >
            <template #hint>Text that will be shown in the menu.</template>
          </q-input>
          <q-input
            v-model="menuItemData.path"
            type="text"
            label="Path"
            bottom-slots
          >
            <template #hint>
              Must start with <em>/about/</em>, <em>/resources/</em>,
              <em>/contact/</em>, or <em>/pages/</em>.
            </template>
          </q-input>
          <q-input
            v-model="menuItemData.to"
            type="url"
            label="URL"
            bottom-slots
          >
            <template #hint>If this is an external url instead. </template>
          </q-input>
          <q-toggle
            v-model="menuItemData.requiresAuth"
            label="Requires Logged In"
            class="full-width"
          />

          <q-toggle
            v-model="menuItemData.requiresAdmin"
            label="Requires Marathon Admin"
            class="full-width"
          />
        </q-card-section>
        <q-card-actions>
          <q-btn label="Submit" type="submit" color="primary" />
          <q-btn
            label="Cancel"
            type="reset"
            color="primary"
            flat
            class="q-ml-sm"
          />
        </q-card-actions> </q-form
      >w
    </q-card>
  </q-dialog>
</template>

<script>
// TODO: add dropdown to pull from /app/pages to add pages/${slug}
// NOTE: this will not link, so the menu will not update automatically.
// path must either be /about, /resources, or /pages
import { defineComponent, ref, watch } from "vue";

export default defineComponent({
  name: "EditMenuItem",
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    menuItem: {
      type: Object,
      default: () => {
        return {
          label: "",
          path: "",
          to: "",
          requiresAuth: false,
          requiresAdmin: false,
        };
      },
    },
  },
  emits: ["update:isOpen", "updateItem"],
  setup(props, { emit }) {
    const menuItemData = ref({ ...props.menuItem });
    const isSubmitting = ref(false);
    const isSubmitted = ref(false);

    watch(
      () => props.menuItem,
      (currentValue) => {
        menuItemData.value = { ...currentValue };
      }
    );

    const onSubmit = async () => {
      emit("updateItem", menuItemData.value);
      setTimeout(() => {
        emit("update:isOpen", false);
      }, 1000);
    };

    const onReset = () => {
      emit("update:isOpen", false);
    };

    return {
      menuItemData,
      onSubmit,
      isSubmitting,
      isSubmitted,
      onReset,
    };
  },
});
</script>
