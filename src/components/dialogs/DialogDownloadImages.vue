<template>
  <q-dialog :model-value="isDownloadOpen" @update:model-value="closeModal">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div>
          <span>(flattened .jpg)</span><q-toggle v-model="png" /><span>(transparent .png)</span>
        </div>
      </q-card-section>
      <q-card-section>
        <div v-if="errorMessage">
          {{ errorMessage }}
        </div>
        <div v-if="zipProgress > 0">
          Zipping Files:
          <div class="row align-center">
            <q-linear-progress stripe :value="zipProgress" class="col q-mt-sm q-mr-md" />
            <q-icon v-if="zipProgress == 1" name="done" />
            <q-spinner-hourglass v-else />
          </div>
        </div>
        <div v-if="downloadProgress > 0">
          Downloading Files:
          <div class="row">
            <q-linear-progress stripe :value="downloadProgress" class="col q-mt-sm q-mr-md" />
            <q-icon v-if="downloadProgress == 1" name="done" />
            <q-spinner-hourglass v-else />
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="around">
        <q-btn label="Start Download" @click="download()" />
        <q-btn label="Cancel" @click="$emit('update:isDownloadOpen', false)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia";
import { db } from "boot/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFunctions, httpsCallable } from "@firebase/functions";
import JSZip from "jszip";

export default defineComponent({
  name: "DialogDownloadImages",
  props: {
    isDownloadOpen: {
      type: Boolean,
      required: true,
    },
    skus: {
      type: Array,
      required: true,
    },
  },
  emits: ["update:isDownloadOpen", "downloadComplete"],
  setup(props, { emit }) {
    const userStore = useUserStore();
    const { userData } = storeToRefs(userStore);
    const functions = getFunctions();
    const fetchImages = httpsCallable(functions, "callablefetchimages");
    const zip = new JSZip();
    const png = ref(true);
    const zipProgress = ref(0);
    const downloadProgress = ref(0);
    const errorMessage = ref(null);

    const download = async () => {
      let images = [];
      let logUserData = {};
      const skuPromises = props.skus.map(async (sku) => {
        await fetchImages(`products/${sku}`).then(({ data }) => {
          if (Array.isArray(data) && data.length > 0) {
            images = [...images, ...data];
            // Log the Downloads
            const logProductData = {
              [userData.value.uid]: {
                user: userData.value.name,
                uid: userData.value.uid,
                account: userData.value.account,
                sku: sku,
                date: serverTimestamp(),
              },
            };

            setDoc(doc(db, `downloads_product/${sku}`), logProductData, {
              merge: true,
            });

            logUserData = {
              ...logUserData,
              [sku]: {
                sku: sku,
                user: userData.value.name,
                uid: userData.value.uid,
                account: userData.value.account,
                product: sku,
                date: serverTimestamp(),
              },
            };
          }
        });
      });

      await Promise.all(skuPromises);
      setDoc(doc(db, `downloads_user/${userData.value.uid}`), logUserData, {
        merge: true,
      });

      if (images && images.length > 0) {
        // start fetching the images...

        const imagePromises = images.map(async (image) => {
          let imageUrl = image.url;
          let imageName = image.name;

          if (!png.value) {
            // Apply ImageKit transformation to convert PNG to JPEG
            imageUrl = `${image.url}?tr=f-jpg,bg-ffffff`;
            imageName = image.name.replace('.png', '.jpg');
          }

          const response = await fetch(imageUrl);
          const blob = await response.blob();
          zip.file(imageName, blob);
        });
        // Wait for all images to be added to zip
        await Promise.all(imagePromises);
        const zipBlob = await zip.generateAsync(
          { type: "blob" },
          (metadata) => {
            zipProgress.value = (metadata.percent || 0) / 100;
            console.log("zip: ", zipProgress.value);
          }
        );
        const hash = Math.random().toString(36).slice(2);
        const downloadName =
          props.skus.length > 1
            ? `${userData.value.account}-${hash}`
            : `${userData.value.account}-${props.skus[0]}`;
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(zipBlob);
        downloadLink.download = downloadName + ".zip";
        const xhr = new XMLHttpRequest();
        xhr.open("GET", URL.createObjectURL(zipBlob), true);
        xhr.responseType = "blob";
        xhr.addEventListener("progress", (event) => {
          downloadProgress.value = event.loaded / event.total;
          console.log("download: ", downloadProgress.value);
        });
        xhr.onload = () => {
          if (xhr.status === 200) {
            downloadLink.href = URL.createObjectURL(xhr.response);
            downloadLink.click();
          }
        };
        xhr.send();
      } else {
        errorMessage.value = "No Images found.";
      }
      console.log("download complete");
      emit("downloadComplete");
      setTimeout(() => {
        emit("update:isDownloadOpen", false);
      }, 1000);
    };

    const closeModal = (value) => {
      // Reset state when modal closes
      if (!value) {
        zipProgress.value = 0;
        downloadProgress.value = 0;
        errorMessage.value = null;
        emit("update:isDownloadOpen", false);
      }
    };

    return {
      png,
      download,
      zipProgress,
      downloadProgress,
      closeModal,
      errorMessage,
    };
  },
});
</script>
