<template>
  <q-dialog
    :model-value="isOpen"
    maximized
    @update:model-value="(value) => $emit('update:isOpen', value)"
  >
    <q-card>
      <q-form class="column full-height" @submit="onSubmit" @reset="onReset">
        <q-card-section class="col-auto">
          <q-input
            v-model="pageData.title"
            type="text"
            required
            label="Title"
            @update:model-value="
              if (!manualSlug) {
                pageData.slug = slugify(pageData.title);
              }
            "
          />
          <q-input
            v-model="pageData.slug"
            type="text"
            required
            label="Slug"
            @blur="
              if (pageData.slug !== slugify(pageData.title)) {
                manualSlug = true;
              }
              pageData.slug = slugify(pageData.slug);
            "
          />
        </q-card-section>
        <q-card-section v-if="pageData.slug === '/'"> </q-card-section>
        <q-card-section class="content col">
          <q-input
            v-model="pageData.content"
            filled
            outlined
            class="full-height"
            type="textarea"
            label="Content"
            hint="HTML content"
            :rules="[(val) => (val && val.length > 0) || 'Required']"
          />
        </q-card-section>
        <q-card-actions class="col-auto">
          <q-btn label="Submit" type="submit" color="primary" />
          <q-btn
            label="Cancel"
            type="reset"
            color="primary"
            flat
            class="q-ml-sm"
          />
          <q-btn
            v-show="page?.title"
            label="Delete"
            color="warning"
            flat
            class="q-ml-sm"
            icon="delete_forever"
            @click="deletePage"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
// TODO: See below
/*
Store field with file info and url/path link
create upload_image callable function
*/
import { defineComponent, computed, ref, watch } from "vue";
import { db } from "boot/firebase";
import { doc, setDoc, serverTimestamp, deleteField } from "@firebase/firestore";
import { getFunctions, httpsCallable } from "@firebase/functions";

export default defineComponent({
  name: "EditPage",
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    page: {
      type: Object,
      default: () => {
        return {
          id: `${Math.random().toString(36).substring(7)}`,
          slug: "",
          title: "",
          content: "",
        };
      },
    },
  },
  emits: ["update:isOpen"],
  setup(props, { emit }) {
    const functions = getFunctions();
    const fetchImages = httpsCallable(functions, "callablefetchimages");
    // grab carousel images if editing the home page content
    if (props.page.slug === "/") {
    }
    const pageData = ref({
      ...props.page,
    });
    const carouselImages = ref(null);
    const errorMessage = ref(null);
    const isSubmitting = ref(false);
    const isSubmitted = ref(false);
    const isError = ref(false);
    const slugify = (text) => {
      return text
        ? text
            .trim()
            .replace(/[^\w\s]/gi, "") // Remove non-alphanumeric characters
            .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")) // camelCase
            .replace(/^(.)/, (_, c) => c.toLowerCase())
        : ""; // Make first letter lowercase
    };
    const manualSlug = ref(
      props.slug ? props.slug !== slugify(props.title) : false
    );
    watch(
      () => props.page,
      (currentValue) => {
        pageData.value = { ...currentValue };
      },
      { immediate: true }
    );

    const onSubmit = async () => {
      await setDoc(
        doc(db, "app/pages"),
        {
          [pageData.value.id]: {
            ...pageData.value,
            updated_at: serverTimestamp(),
          },
        },
        { merge: true }
      ).then(() => {
        emit("update:isOpen", false);
      });
    };

    const onReset = () => {
      // pageData.value = {}; // do not remove data in case of accidental click.
      errorMessage.value = null;
      isSubmitting.value = false;
      emit("update:isOpen", false);
    };

    const deletePage = async () => {
      await setDoc(
        doc(db, "app/pages"),
        { [pageData.value.id]: deleteField() },
        { merge: true }
      ).then(() => {
        emit("update:isOpen", false);
      });
    };

    return {
      pageData,
      onSubmit,
      isSubmitting,
      isSubmitted,
      onReset,
      deletePage,
      isError,
      errorMessage,
      slugify,
      manualSlug,
      carouselImages,
    };
  },
});
</script>
<style lang="scss">
.content .q-field__control {
  height: 100%;
  textarea {
    height: 100%;
    overflow-y: scroll;
  }
}
</style>
