<template>
  <div class="row flex-center flex-column">
    <q-table
      :columns="columns"
      :rows="tradeshowData"
      row-key="name"
      :hide-pagination="true"
      :pagination="{ rowsPerPage: 1000 }"
      class="col-12 column"
    >
      <template #body-cell-image="{ row }">
        <q-td class="cell-image">
          <q-img
            :src="row.imageURL"
            loading="lazy"
            fit="contain"
            style="margin-left: 1rem"
          />
        </q-td>
      </template>
      <template #body-cell-actions="{ row }">
        <q-td>
          <q-btn icon="edit" @click.prevent="editTradeshow(row)" />
          <q-btn icon="delete_forever" @click.prevent="deleteTradeshow(row)" />
        </q-td>
      </template>
    </q-table>
    <edit-tradeshow
      :key="editingTradeshow"
      v-model:isOpen="isEditTradeshowOpen"
      v-model:tradeshow="editingTradeshow"
    />
    <q-btn
      class="q-mt-md"
      label="Add New Tradeshow"
      @click="
        editingTradeshow = undefined;
        isEditTradeshowOpen = true;
      "
    />
  </div>
</template>

<script>
import { defineComponent, onBeforeMount, onBeforeUnmount, ref } from "vue";
import { db } from "boot/firebase";
import { doc, onSnapshot, setDoc } from "@firebase/firestore";

import EditTradeshow from "../../components/admin/EditTradeshow.vue";

export default defineComponent({
  name: "AdminTradeshows",
  components: {
    EditTradeshow,
  },
  setup() {
    const tradeshowData = ref([]);
    const isEditTradeshowOpen = ref(false);
    const editingTradeshow = ref(undefined);
    const columns = [
      {
        name: "image",
        label: "Image",
        sortable: false,
        field: "imageURL",
        align: "center",
      },
      {
        name: "name",
        label: "Name",
        sortable: true,
        field: "name",
        align: "center",
      },
      {
        name: "description",
        label: "Description",
        sortable: true,
        field: "description",
        align: "left",
      },
      {
        name: "url",
        label: "URL",
        sortable: true,
        field: "url",
        align: "left",
      },
      {
        name: "location",
        label: "Location",
        sortable: true,
        field: "location",
        align: "center",
      },
      {
        name: "startDate",
        label: "Start Date",
        sortable: true,
        field: "startDate",
        align: "left",
      },
      {
        name: "endDate",
        label: "End Date",
        sortable: true,
        field: "endDate",
        align: "left",
      },
      {
        name: "timezone",
        label: "Timezone",
        sortable: true,
        field: "timezone",
        format: (val, row) => val?.label,
        align: "left",
      },
      {
        name: "actions",
        label: "",
        sortable: false,
        field: "",
        align: "center",
      },
    ];
    let snapshotListenerUnsubscribe = null;
    onBeforeMount(async () => {
      snapshotListenerUnsubscribe = onSnapshot(
        doc(db, "app/tradeshows"),
        (doc) => {
          tradeshowData.value = Object.values(doc.data());
        }
      );
    });
    onBeforeUnmount(() => {
      if (snapshotListenerUnsubscribe !== null) {
        snapshotListenerUnsubscribe();
      }
    });
    const editTradeshow = (row) => {
      editingTradeshow.value = row;
      isEditTradeshowOpen.value = true;
    };
    const deleteTradeshow = async (row) => {
      const titleKey = row.title
        .trim()
        .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""));
      await setDoc(
        doc(db, "app/tradeshows"),
        { [titleKey]: deleteField() },
        { merge: true }
      );
    };
    return {
      columns,
      tradeshowData,
      isEditTradeshowOpen,
      editingTradeshow,
      editTradeshow,
      deleteTradeshow,
    };
  },
});
</script>
