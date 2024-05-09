<template>
  <div v-if="pageData.content" v-dompurify-html="pageData.content" />
  <q-spinner v-else />
</template>

<script>
import { defineComponent, onBeforeMount, ref } from "vue";
import { doc, getDoc } from "firebase/firestore";
import { db } from "boot/firebase";

export default defineComponent({
  name: "PageSimple",
  props: {
    page: {
      required: true,
      type: String,
    },
  },
  setup(props) {
    const pageData = ref({});

    onBeforeMount(async () => {
      await getDoc(doc(db, "app/pages")).then((docSnap) => {
        if (docSnap.exists()) {
          const pages = Object.values(docSnap.data());
          pageData.value = pages.find((page) => page.slug === props.page);
          if (pageData.value) {
          } else {
            pageData.value = {
              title: "Not Found",
              content: `<p class="text-center absolute-center">Sorry, There doesn't seem to be any content for this page anymore.</p>`,
            };
          }
        }
      });
    });
    return { pageData };
  },
});
</script>
