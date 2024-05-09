<template>
  <q-table
    v-model:pagination="pagination"
    v-model:selected="selected"
    dense
    :grid="$q.screen.lt.md"
    :rows="productData"
    :columns="columns"
    :loading="productData?.length<1"
    selection="multiple"
    :filter="filter"
    :filter-method="filterMethod"
    :selected-rows-label="getSelectedString"
    rows-per-page-label="Items Per Page"
    :rows-per-page-options="[20, 40, 60]"
    row-key="name"
    card-container-class="q-gutter-sm q-pr-sm"
    @row-click="onRowClick"
    @update:selected="onSelection"
  >
    <template #top>
      <div class="q-gutter-md row items-center justify-end full-width">
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
        <q-select
          v-model="pagination.rowsPerPage"
          :options="perPageOptions"
          label="Products Per Page"
          filled
          style="min-width: 10rem"
        />
        <q-select
          v-model="sortBy"
          :options="sortByOptions"
          label="Order By"
          filled
          style="min-width: 10rem"
        />
      </div>
    </template>
    <template #bottom-row>
      <q-tr>
        <q-td colspan="3">
          <q-btn
            label="Download Images"
            :disabled="selected.length == 0"
            icon="download"
            @click="isDownloadOpen = true"
          />
        </q-td>
      </q-tr>
    </template>
    <template #body-selection="scope">
      <q-checkbox v-if="!scope.row.children" v-model="scope.selected" />
    </template>
    <template #body-cell-image="{ row }">
      <q-td class="cell-image">
        <suspense>
          <image-thumbnail
            :sku="row.sku"
            :ratio="1"
            size="thumb"
            style="margin-left: 1rem"
          />
          <template #fallback>
            <q-skeleton class="image-skeleton" square animation="fade" />
          </template>
        </suspense>
      </q-td>
    </template>
    <template #body-cell-path="{ row }">
      <q-td>
        <div>
          <router-link :to="`/products/${row.collection}`">
            <strong>{{ appStore.getCollectionLabel(row.collection) }}</strong>
          </router-link>
        </div>
        <div>
          <router-link :to="`/products/${row.collection}/${row.category}`">
            <em>{{
              appStore.getCategoryLabel(row.collection, row.category)
            }}</em>
          </router-link>
        </div>
      </q-td>
    </template>
    <template #body-cell-actions="{ row }">
      <q-td>
        <div class="flex column">
          <button-favorite :sku="row.sku" />
          <button-download :sku="row.sku" />
          <button-add-to-cart :sku="row.sku" />
        </div>
      </q-td>
    </template>
    <template #item="{ row }">
      <q-card :to="`/product/${row.sku}`" class="col-12 q-ma-sm">
        <q-card-section
          class="bg-dark text-white column justify-center col-12 q-py-none"
        >
          <q-btn :to="`/product/${row.sku}`" :label="row.name" size="lg" flat />
        </q-card-section>
        <q-separator />
        <q-card-section horizontal>
          <q-card-section class="justify-center column justify-center col-6">
            <suspense>
              <image-thumbnail
                :sku="row.sku"
                :ratio="1"
                size="thumb"
                style="max-height: 120px"
              />
              <template #fallback>
                <q-skeleton class="image-skeleton" square animation="fade" />
              </template>
            </suspense>
          </q-card-section>
          <q-separator />
          <q-card-section class="column justify-center col-6">
            <div class="text-subtitle1">
              <div>
                <router-link :to="`/products/${row.collection}`">
                  <strong>{{
                    appStore.getCollectionLabel(row.collection)
                  }}</strong>
                </router-link>
              </div>
              <div>
                <router-link
                  :to="`/products/${row.collection}/${row.category}`"
                >
                  <em>{{
                    appStore.getCategoryLabel(row.collection, row.category)
                  }}</em>
                </router-link>
              </div>
            </div>
            <div class="text-subtitle2">${{ row.price }}</div>
            <div v-if="row.materials" class="text-subtitle2">
              {{ row.materials.join(", ") }}
            </div>
            <q-space />
            <div class="text-caption">
              Last Ordered: {{ prettyDate(row.recent_order_time) }}
            </div>
          </q-card-section>
        </q-card-section>
        <q-separator />
        <q-card-actions
          align="center"
          vertical
          class="justify-around q-px-md col-2 col-xs-12"
        >
          <div class="flex row">
            <button-favorite :sku="row.sku" />
            <button-download :sku="row.sku" />
            <button-add-to-cart :sku="row.sku" />
          </div>
        </q-card-actions>
      </q-card>
    </template>
  </q-table>
  <suspense v-if="isDownloadOpen">
    <dialog-download-images
      v-model:is-download-open="isDownloadOpen"
      v-model:download-complete="downloadComplete"
      :skus="selected.map((row) => row.sku)"
    />
  </suspense>
</template>

<script>
import {
  defineAsyncComponent,
  defineComponent,
  onBeforeMount,
  ref,
  watch,
} from "vue";
import { date } from "quasar";
import { useRouter } from "vue-router";
import { useAppStore } from "stores/app";
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia";
import { db } from "boot/firebase";
import { doc, getDoc } from "firebase/firestore";
import ButtonAddToCart from "src/components/buttons/ButtonAddToCart.vue";
import ButtonDownload from "src/components/buttons/ButtonDownload.vue";
import ButtonFavorite from "src/components/buttons/ButtonFavorite.vue";

const DialogDownloadImages = defineAsyncComponent(() =>
  import("src/components/dialogs/DialogDownloadImages.vue")
);
const ImageThumbnail = defineAsyncComponent(() =>
  import("components/shop/ImageThumbnail.vue")
);

export default defineComponent({
  name: "Ordered",
  components: {
    ButtonAddToCart,
    ButtonDownload,
    ButtonFavorite,
    ImageThumbnail,
    DialogDownloadImages,
  },
  setup() {
    const router = useRouter();
    const appStore = useAppStore();
    appStore.breadcrumbs = [
      {
        label: "Account",
        path: "/account",
      },
      { label: "Image Downloads", path: "/account/images" },
    ];
    const userStore = useUserStore();
    const { userData } = storeToRefs(userStore);
    const perPageOptions = ref([20, 40, 60]);
    const sortBy = ref({
      value: "recent_order_time",
      label: "Recently Ordered",
    });
    const sortByOptions = ref([
      { value: "name", label: "SKU", descending: false },
      {
        value: "recent_order_time",
        label: "Recently Ordered",
        descending: true,
      },
      { value: "quantity", label: "Quantity", descending: true },
      { value: "price", label: "Price (lowest)", descending: true },
      { value: "price", label: "Price (highest)", descending: false },
    ]);
    const pagination = ref({
      sortBy: "recent_order_time",
      descending: true,
      page: 1,
      rowsPerPage: 40,
    });
    const productData = ref([]);
    const selected = ref([]);
    const isDownloadOpen = ref(false);
    const downloadComplete = ref(false);
    onBeforeMount(async () => {
      await getDoc(
        doc(db, `accounts/${userData.value.account}/ordered/items`)
      ).then((docSnap) => {
        if (docSnap.exists()) {
          console.log(docSnap.data());
          productData.value = Object.values(docSnap.data()).filter(
            (product) => product.shipped
          );
          console.log(productData.value);
        }
      });
    });

    // sync sortBy with pagination
    watch(sortBy, (currentValue) => {
      pagination.value.sortBy = currentValue.value;
      pagination.value.descending = currentValue.descending;
    });

    const columns = [
      {
        name: "image",
        label: "",
        sortable: false,
        field: "",
        align: "center",
      },
      {
        name: "name",
        label: "Product",
        sortable: false,
        field: "name",
        align: "center",
      },
      {
        name: "actions",
        label: "",
        sortable: false,
        field: "",
        align: "center",
      },
      {
        name: "path",
        label: "Collection / Category",
        sortable: false,
        align: "left",
      },
      {
        name: "materials",
        label: "Metal(s)",
        sortable: false,
        field: "materials",
        format: (val, row) => (val ? val.join(", ") : ""),
        align: "left",
      },
      {
        name: "price",
        label: "MSRP",
        sortable: false,
        field: "price",
        format: (val) => (val ? `$${val}` : ""),
      },
      {
        name: "quantity",
        label: "Quantity",
        sortable: false,
        field: "quantity",
        align: "right",
      },
      {
        name: "recent_order_time",
        label: "Recently Ordered",
        sortable: false,
        field: "recent_order_time",
        format: (val) => prettyDate(val),
        align: "center",
      },
    ];
    const onRowClick = function (event, row) {
      if (event.target.nodeName === "TD") {
        // prevent calling this when clicking buttons/checkboxes/inputs...
        router.push(`/product/${row.sku}`);
      }
    };
    const prettyDate = (firestoreTime) => {
      const test = firestoreTime && firestoreTime.toDate();
      if (test) {
        return date.formatDate(test, "M/D/YY");
      } else {
        return "";
      }
    };
    const filter = ref("");
    // TODO: get filterMethod to work... ???
    const filterMethod = (rows, terms, cols, getCellValue) => {
      const filteredRows = rows.filter((row) => {
        const collectionLabel = appStore.getCollectionLabel(row.collection);
        const categoryLabel = appStore.getCategoryLabel(
          row.collection,
          row.categeory
        );
        return (
          row["name"].toLowerCase().includes(terms.toLowerCase()) ||
          collectionLabel?.toLowerCase().includes(terms.toLowerCase()) ||
          categoryLabel?.toLowerCase().includes(terms.toLowerCase())
        );
      });
      return filteredRows;
    };
    // prevent items with children from being added
    const onSelection = (newSelection) => {
      console.log(newSelection);
      selected.value = newSelection.filter((selection) => !selection.children);
      console.log(selected.value);
    };
    const getSelectedString = () => {
      return selected.value.length === 0
        ? ""
        : `${selected.value.length} item${
            selected.value.length > 1 ? "s" : ""
          } selected of ${productData.value.length}`;
    };

    return {
      sortBy,
      sortByOptions,
      perPageOptions,
      pagination,
      columns,
      productData,
      selected,
      onRowClick,
      prettyDate,
      filter,
      filterMethod,
      onSelection,
      getSelectedString,
      isDownloadOpen,
      downloadComplete,
      appStore,
    };
  },
});
</script>
<style lang="scss" scoped>
.cell-image {
  height: 120px !important;
  padding: 0 !important;
  min-width: 120px !important;
  width: 120px !important;
}
</style>
