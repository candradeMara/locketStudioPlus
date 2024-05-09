<template>
  <div class="row flex-center flex-column">
    <q-table
      :columns="columns"
      :rows="pageData"
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
          <q-btn icon="edit" @click.prevent="editPage(row)" />
          <q-btn icon="delete_forever" @click.prevent="deletePage(row)" />
        </q-td>
      </template>
    </q-table>
    <edit-page v-model:isOpen="isEditPageOpen" :page="editingPage" />
    <q-btn
      class="q-mt-md"
      label="Add New Page"
      @click="
        editingPage = undefined;
        isEditPageOpen = true;
      "
    />
  </div>
</template>

<script>
import { defineComponent, onBeforeMount, onBeforeUnmount, ref } from "vue";
import { date } from "quasar";
import { db } from "boot/firebase";
import { deleteField, doc, onSnapshot, setDoc } from "@firebase/firestore";
import EditPage from "components/admin/EditPage.vue";

export default defineComponent({
  name: "AdminPages",
  components: {
    EditPage,
  },
  setup() {
    const pageData = ref([]);
    const isEditPageOpen = ref(false);
    const editingPage = ref(undefined);
    const columns = [
      {
        name: "title",
        label: "Title",
        sortable: true,
        field: "title",
        align: "left",
      },
      {
        name: "content",
        label: "Content",
        sortable: true,
        field: "content",
        format: (val, row) =>
          val
            ?.replace(/(<([^>]+)>)/gi, " ")
            .trim()
            .replace(/\s+/g, " ")
            .substring(0, 30) + "...",
        align: "left",
      },
      {
        name: "updated_at",
        label: "Updated",
        sortable: true,
        sort: (a, b, rowA, rowB) => a.seconds - b.seconds,
        field: "updated_at",
        format: (val, row) => prettyDate(val),
      },
      {
        name: "actions",
        label: "",
        sortable: false,
        field: "",
        align: "right",
      },
    ];

    let snapshotListenerUnsubscribe = null;
    onBeforeMount(async () => {
      snapshotListenerUnsubscribe = onSnapshot(doc(db, "app/pages"), (doc) => {
        if (doc.data()) {
          pageData.value = Object.values(doc.data());
        }
      });
    });
    onBeforeUnmount(() => {
      if (snapshotListenerUnsubscribe !== null) {
        snapshotListenerUnsubscribe();
      }
    });
    const prettyDate = (uglyDate) => {
      const test = uglyDate && uglyDate.toDate();
      if (test) {
        return date.formatDate(test, "M/D/YY");
      } else {
        return "";
      }
    };

    const editPage = (row) => {
      editingPage.value = row;
      isEditPageOpen.value = true;
    };
    const deletePage = async (row) => {
      console.log(row);
      await setDoc(
        doc(db, "app/pages"),
        { [row.id]: deleteField() },
        { merge: true }
      );
    };

    return {
      columns,
      pageData,
      isEditPageOpen,
      editingPage,
      editPage,
      deletePage,
    };
  },
});
</script>
