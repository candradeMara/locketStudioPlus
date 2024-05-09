<template>
  <q-dialog
    :model-value="isOpen"
    @update:model-value="(value) => $emit('update:isOpen', value)"
  >
    <q-card style="min-width: 350px">

      <q-form @submit="onSubmit" @reset="onReset">
        <q-card-section>
          <q-file v-model="imageUpload" label="Image" accept=".jpg, image/*">
            <template #prepend>
              <q-icon name="add_photo_alternate" />
            </template>
          </q-file>
          <q-img v-show="imageUploadPreview" :src="imageUploadPreview">
            <q-icon
              class="absolute all-pointer-events"
              size="32px"
              name="clear"
              color="white"
              style="top: 8px; right: 8px; cursor: pointer"
              @click="imageUpload = null"
            />
          </q-img>
          <q-img v-show="tradeshowData.imageURL" :src="tradeshowData.imageURL">
            <q-icon
              class="absolute all-pointer-events"
              size="32px"
              name="clear"
              color="white"
              style="top: 8px; right: 8px; cursor: pointer"
              @click="imageUpload = null"
            />
          </q-img>
          <q-input
            v-model="tradeshowData.name"
            type="text"
            required
            label="Name"
          />
          <q-input
            v-model="tradeshowData.description"
            type="text"
            label="Description"
          />
          <q-input v-model="tradeshowData.url" type="url" label="URL Link" />
          <q-input
            v-model="tradeshowData.location"
            type="text"
            label="Location"
          />
          <q-input
            v-model="tradeshowData.startDate"
            label="Start Date"
            required
          >
            <q-popup-proxy
              :breakpoint="400"
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="dateRange" mask="YYYY-MM-DD" range />
            </q-popup-proxy>
          </q-input>
          <q-input v-model="tradeshowData.endDate" label="End Date">
            <q-popup-proxy
              :breakpoint="400"
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="dateRange" mask="YYYY-MM-DD" range />
            </q-popup-proxy>
          </q-input>
          <q-select
            v-model="tradeshowData.timezone"
            label="Time Zone"
            :options="timezoneOptions"
          ></q-select>
        </q-card-section>
        <q-card-actions spread>
          <q-btn
            label="Cancel"
            type="reset"
            color="primary"
            flat
            class="q-ml-sm"
          />
          <q-btn
            v-show="tradeshow?.name"
            label="Delete"
            color="warning"
            flat
            class="q-ml-sm"
            @click="deleteTradeshow"
          />
          <q-btn label="Submit" type="submit" color="primary" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, computed, ref, watch } from "vue";
import { db } from "boot/firebase";
import { doc, setDoc, deleteField } from "@firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export default defineComponent({
  name: "EditTradeshow",
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    tradeshow: {
      type: Object,
      default: () => {
        return {
          id: Math.random().toString(36).substring(7),
          name: "",
          description: "",
          url: "",
          location: "",
          startDate: "",
          endDate: "",
          imageURL: "",
          timezone: "",
        };
      },
    },
  },
  emits: ["update:tradeshow", "update:isOpen"],
  setup(props, { emit }) {
    const storage = getStorage();
    const tradeshowData = ref({ ...props.tradeshow });
    watch(
      () => props.tradeshow,
      (currentValue) => {
        tradeshowData.value = { ...currentValue };
      },
      { immediate: true }
    );
    const imageUpload = ref(null);
    const errorMessage = ref(null);
    const isSubmitting = ref(false);
    const isSubmitted = ref(false);
    const isError = ref(false);
    const dateRange = ref(
      props.tradeshow.endDate
        ? {
            from: props.tradeshow.startDate,
            to: props.tradeshow.endDate,
          }
        : props.tradeshow.startDate
    );
    const timezoneOptions = ref([
      { label: "Eastern", value: "America/New_York" },
      { label: "Central", value: "America/Chicago" },
      { label: "Mountain", value: "America/Denver" },
      { label: "Pacific", value: "America/Los_Angeles" },
    ]);
    const imageUploadPreview = computed(() => {
      if (imageUpload.value !== null) {
        const file = imageUpload.value;
        return URL.createObjectURL(file);
      } else return null;
    });
    watch(dateRange, (currentValue) => {
      tradeshowData.value.startDate = currentValue?.from
        ? currentValue.from
        : props.tradeshow.startDate;
      tradeshowData.value.endDate = currentValue?.to
        ? currentValue.to
        : props.tradeshow.endDate;
    });

    const onSubmit = async () => {
      // upload image then add info to firestore
      if (imageUpload.value) {
        // upload the image and get the dataURL
        const fileName = imageUpload.value.name;
        const imageStorageRef = storageRef(storage, `tradeshows/${fileName}`);
        await uploadBytes(imageStorageRef, imageUpload.value).then(
          async (snapshot) => {
            await getDownloadURL(snapshot.ref).then((downloadURL) => {
              tradeshowData.value.imageURL = downloadURL;
            });
          }
        );
      }

      await setDoc(
        doc(db, "app/tradeshows"),
        { [tradeshowData.value.id]: tradeshowData.value },
        { merge: true }
      ).then(() => {
        emit("update:tradeshow", undefined);
        emit("update:isOpen", false);
      });
    };

    const onReset = () => {
      // tradeshowData.value = {}; // do not remove data in case of accidental click.
      errorMessage.value = null;
      isSubmitting.value = false;
      emit("update:tradeshow", undefined);
      emit("update:isOpen", false);
    };

    const deleteTradeshow = async () => {
      await setDoc(
        doc(db, "app/tradeshows"),
        { [tradeshowData.value.id]: deleteField() },
        { merge: true }
      ).then(() => {
        emit("update:tradeshow", undefined);
        emit("update:isOpen", false);
      });
    };

    return {
      tradeshowData,
      timezoneOptions,
      imageUpload,
      imageUploadPreview,
      dateRange,
      onSubmit,
      isSubmitting,
      isSubmitted,
      onReset,
      deleteTradeshow,
      isError,
      errorMessage,
    };
  },
});
</script>
