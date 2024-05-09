<template v-if="isShipped(sku)">
  <q-btn
    flat
    round
    color="dark"
    :icon="downloadComplete ? 'download_done' : 'download'"
    @click.prevent="isDownloadOpen = true"
  >
    <q-tooltip v-if="tooltip">Download Images</q-tooltip>
  </q-btn>
  <dialog-download-images
    v-model:is-download-open="isDownloadOpen"
    v-model:download-complete="downloadComplete"
    :skus="[sku]"
    @close="handleModalClose"
  />
</template>
<script>
import { useAccountStore } from "stores/account";
import { storeToRefs } from "pinia";
import DialogDownloadImages from "components/dialogs/DialogDownloadImages.vue";
// const DialogDownloadImages = defineAsyncComponent(() =>
//   import("src/components/dialogs/DialogDownloadImages.vue")
// );

import { defineComponent, defineAsyncComponent, ref } from "vue";

export default defineComponent({
  name: "ButtonDownload",
  components: { DialogDownloadImages },
  props: {
    sku: {
      type: String,
      required: true,
    },
    tooltip: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const accountStore = useAccountStore();
    const { isShipped } = storeToRefs(accountStore);
    const isDownloadOpen = ref(false);
    const downloadComplete = ref(false);
    const handleModalClose = () => {
      // Reset state when modal closes
      downloadComplete.value = false;
    };
    return { isShipped, isDownloadOpen, downloadComplete, handleModalClose };
  },
});
</script>
