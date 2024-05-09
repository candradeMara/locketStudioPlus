<template>
  <q-table
    v-model:selected="selected"
    v-model:pagination="pagination"
    :dense="$q.screen.lt.md"
    :grid="grid"
    :rows="productData"
    :columns="columns"
    :loading="!productData.length"
    no-data-label="Fetching..."
    selection="multiple"
    :selected-rows-label="getSelectedString"
    row-key="sku"
    rows-per-page-label="Items Per Page"
    :rows-per-page-options="perPageOptions"
    card-container-class="q-col-gutter-md row wrap justify-center q-mb-md q-pa-md"
    @update:selected="onSelection"
    @request="onRequest"
    @row-click="onRowClick"
  >
    <template #top>
      <div class="q-gutter-md row items-center justify-end full-width">
        <q-select
          v-model="pagination.rowsPerPage"
          :options="perPageOptions"
          label="Products Per Page"
          filled
          style="min-width: 10rem"
          @update:model-value="onRequest"
        />
        <q-select
          v-model="sortBy"
          :options="sortOptions"
          label="Order By"
          filled
          style="min-width: 10rem"
        />

        <q-btn-group flat>
          <q-btn
            flat
            icon="view_module"
            :class="grid ? 'active' : ''"
            @click="grid = true"
          />
          <q-btn
            flat
            icon="view_list"
            :class="!grid ? 'active' : ''"
            @click="grid = false"
          />
        </q-btn-group>
      </div>
    </template>
    <template #bottom-row>
      <q-tr>
        <q-td colspan="3">
          <q-btn
            label="Add To Cart"
            :disabled="selected.length == 0"
            icon="shopping_basket"
            :loading="isAdding"
            @click="addToCart"
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
    <template #body-cell-actions="{ row }">
      <q-td>
        <div class="row">
          <div class="button-group">
            <button-favorite :sku="row.sku" />
            <button-add-to-cart :sku="row.sku" />
          </div>
        </div>
      </q-td>
    </template>
    <template #item="{ row }">
      <div class="col-xs-6 col-sm-4 col-md-3 col-lg-2">
        <suspense>
          <template #fallback><skeleton-product-grid-item /></template>
          <product-grid-item :item="row" />
        </suspense>
      </div>
    </template>
  </q-table>
</template>

<script>
import { defineComponent, defineAsyncComponent, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "stores/app";
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia";
import { db } from "boot/firebase";
import { doc, getDoc } from "firebase/firestore";
import ButtonAddToCart from "src/components/buttons/ButtonAddToCart.vue";
import ButtonFavorite from "src/components/buttons/ButtonFavorite.vue";
import SkeletonProductGridItem from "components/skeletons/SkeletonProductGridItem.vue";

const ProductGridItem = defineAsyncComponent(() =>
  import("components/shop/ProductGridItem.vue")
);
const ImageThumbnail = defineAsyncComponent(() =>
  import("components/shop/ImageThumbnail.vue")
);

export default defineComponent({
  name: "Favorites",
  components: {
    ButtonAddToCart,
    ButtonFavorite,
    ImageThumbnail,
    ProductGridItem,
    SkeletonProductGridItem,
  },
  setup() {
    const router = useRouter();
    const appStore = useAppStore();
    appStore.breadcrumbs = [
      { label: "Account", path: "/account/" },
      { label: "Favorites", path: "/account/favorites" },
    ];
    const userStore = useUserStore();
    const { getFavorites } = storeToRefs(userStore);
    const productData = ref([]);
    const pagination = ref({
      sortBy: "date",
      descending: false,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: getFavorites.value.length,
    });
    const sortOptions = ref([
      { value: "name", label: "SKU" },
      { value: "date", label: "Date Added" },
    ]);
    const perPageOptions = ref([20, 40, 60]);
    const sortBy = ref({ value: "date", label: "Date Added" });
    const grid = ref(true);
    const fetchProducts = async () => {
      const { page, rowsPerPage, sortBy, descending } = pagination.value;
      let tmpSkus = [];
      // default sorted by "date added"
      if (sortBy === "name") {
        tmpSkus = [...getFavorites.value].sort();
      } else {
        tmpSkus = [...getFavorites.value].reverse();
      }
      tmpSkus = tmpSkus.slice(
        (page - 1) * rowsPerPage,
        rowsPerPage + (page - 1) * rowsPerPage
      );
      // strip out values not in tmpSkus
      let results = [...productData.value].filter((product) => {
        return tmpSkus.includes(product.sku);
      });
      // only fetch and push existing values
      const newFavs = tmpSkus.filter((sku) => {
        return !results.find((product) => product.sku === sku);
      });
      const promises = newFavs.map(async (sku) => {
        await getDoc(doc(db, `products/${sku}`)).then((docSnap) => {
          if (docSnap.exists()) {
            results.push(docSnap.data());
          }
        });
      });
      await Promise.all(promises);
      // sort final result
      if (sortBy === "name") {
        results.sort((a, b) => {
          return a.sku > b.sku ? 1 : -1;
        });
      } else {
        results.sort((a, b) => {
          return tmpSkus.indexOf(a.sku) > tmpSkus.indexOf(b.sku) ? 1 : -1;
        });
      }
      productData.value = results;
    };
    fetchProducts();

    const onRequest = (requestProp) => {
      // take requestProp and update router params and query
      if (requestProp?.pagination) {
        pagination.value = requestProp.pagination;
      }
      if (pagination.value.descending !== false) {
        // reset to page 1 because the products have changed.
        pagination.value.page = 1;
      }
      fetchProducts();
    };

    watch(sortBy, (currentValue) => {
      pagination.value.sortBy = currentValue.value;
      pagination.value.page = 1;
      fetchProducts();
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
        sortable: true,
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
        name: "collection",
        label: "Collection / Category",
        sortable: false,
        field: (row) =>
          `${
            row.collection ? appStore.getCollectionLabel(row.collection) : ""
          }${
            row.category
              ? " / " + appStore.getCategoryLabel(row.collection, row.category)
              : ""
          }`,
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
        sortable: true,
        field: "price",
        format: (val) => `$${val}`,
      },
    ];
    watch(getFavorites.value, () => {});
    const onRowClick = function (event, row) {
      if (event.target.nodeName === "TD") {
        // prevent calling this when clicking buttons/checkboxes/inputs...
        router.push(`/product/${row.sku}`);
      }
    };
    const selected = ref([]);

    // prevent items with children from being added
    const onSelection = (newSelection) => {
      console.log(newSelection);
      selected.value = newSelection.filter((selection) => !selection.children);
    };
    const getSelectedString = () => {
      return selected.value.length === 0
        ? ""
        : `${selected.value.length} item${
            selected.value.length > 1 ? "s" : ""
          } selected of ${productData.value.length}`;
    };
    const isAdding = ref(false);
    const addToCart = async () => {
      isAdding.value = true;
      return new Promise(async (resolve, reject) => {
        const cartItems = items.map((item) => {
          return { sku: item, quantity: 1 };
        });
        await userStore.addToCart(cartItems);
        isAdding.value = false;
        resolve(cartItems);
      });
    };
    return {
      columns,
      sortOptions,
      perPageOptions,
      sortBy,
      grid,
      pagination,
      productData,
      onRowClick,
      onRequest,
      selected,
      onSelection,
      getSelectedString,
      isAdding,
      addToCart,
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
