<template>
  <q-table
    v-model:pagination="pagination"
    :dense="$q.screen.lt.md"
    :rows="testData"
    :columns="columns"
    :loading="testData === []"
    no-data-label="Fetching..."
    :filter="filter"
    :filter-method="filterMethod"
    rows-per-page-label="Items Per Page"
    :rows-pe-page-options="[20, 40, 60]"
    row-key="sku"
    @row-click="onRowClick"
  >
    <template #top-right>
      <q-input
        v-model="filter"
        :outlined="$q.screen.xs"
        dense
        rounded
        debounce="300"
        placeholder="Search"
      >
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>
  </q-table>
</template>

<script>
import { defineComponent, onBeforeMount, ref } from "vue";
import { getFunctions, httpsCallable } from "@firebase/functions";

export default defineComponent({
  name: "LeadTests",
  setup() {
    const functions = getFunctions();
    const fetchImages = httpsCallable(functions, "callablefetchimages");
    const testData = ref([]);
    onBeforeMount(async () => {
      await fetchImages(`resources/testing`).then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          testData.value = data;
        }
      });
    });
    const pagination = ref({
      sortBy: "sku",
      descending: true,
      page: 1,
      rowsPerPage: 40,
    });
    const columns = ref([
      {
        name: "sku",
        label: "Product",
        sortable: true,
        field: "name",
        format: (val) => val.replace(".pdf", ""),
        align: "left",
      },
    ]);
    const filter = ref("");
    const filterMethod = (rows, terms, cols, getCellValue) => {
      const filteredRows = rows.filter((row) => {
        return row["name"].toLowerCase().includes(terms.toLowerCase());
      });
      return filteredRows;
    };
    const onRowClick = function (event, row) {
      window.open(row.url, "_blank");
    };
    return { testData, pagination, columns, onRowClick, filter, filterMethod };
  },
});
</script>
