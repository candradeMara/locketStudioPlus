<template>
  <suspense>
    <categories-list v-if="categories" :categories="categories" />
    <template #fallback>
      <q-spinner-grid color="primary" size="4rem" class="absolute-center" />
    </template>
  </suspense>
  <div class="row q-col-gutter-sm">
    <component
:is="$q.screen.gt.sm ? 'div' : 'q-drawer'" v-model="isFilterOpen" class="col-md-3 col-lg-2" overlay
      elevated>
      <suspense>
        <products-filters
v-model:selectedFilters="selectedFilters" :available-filters="availableFilters"
          :show-categories="true" :show-collections="true" />
        <template #fallback>
          <q-spinner-grid color="primary" size="4rem" class="absolute-center" />
        </template>
      </suspense>
    </component>

    <div class="col-md-9 col-lg-10 col-12">
      <q-table
v-model:pagination="pagination" :rows="products" :columns="columns"
        row-key="name" :grid="grid" rows-per-page-label="Items Per Page" :rows-per-page-options="perPageOptions"
        card-container-class="q-col-gutter-md row wrap justify-center q-mb-md q-pa-md" @row-click="onRowClick"
        @request="onRequest">
        <template #top>
          <div class="q-gutter-md row items-center justify-end full-width">
            <q-btn v-if="$q.screen.lt.md" label="Filter Products" @click="isFilterOpen = true" />
            <q-select
v-model="pagination.rowsPerPage" :options="perPageOptions" label="Products Per Page" filled
              style="min-width: 10rem" @update:model-value="onRequest" />
            <q-select v-model="sortBy" :options="sortByOptions" label="Order By" filled style="min-width: 10rem" />

            <q-btn-group flat>
              <q-btn flat icon="view_module" :class="grid ? 'active' : ''" @click="grid = true" />
              <q-btn flat icon="view_list" :class="!grid ? 'active' : ''" @click="grid = false" />
            </q-btn-group>
          </div>
        </template>
        <template #body-cell-image="{ row }">
          <q-td class="cell-image">
            <suspense>
              <image-thumbnail :sku="row.sku" :ratio="1" size="thumb" style="margin-left: 1rem" />
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
                <button-add-to-cart v-if="isBuyer" :sku="row.sku" />
              </div>
            </div>
          </q-td>
        </template>
        <template #item="{ row }">
          <div class="col-xs-6 col-sm-4 col-md-3 col-lg-2">
            <suspense>
              <template #fallback><skeleton-product-grid-item /></template>
              <product-grid-item :key="row.sku" :item="row" />
            </suspense>
          </div>
        </template>
        <template #fallback><q-inner-loading showing color="primary" /></template>
      </q-table>
    </div>
  </div>
</template>

<script>
import { defineComponent, defineAsyncComponent, ref, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import algoliasearch from "algoliasearch/lite";
import { useAppStore } from "stores/app";
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia";
import ButtonAddToCart from "src/components/buttons/ButtonAddToCart.vue";
import ButtonFavorite from "src/components/buttons/ButtonFavorite.vue";
import SkeletonProductGridItem from "components/skeletons/SkeletonProductGridItem.vue";

const ImageThumbnail = defineAsyncComponent(() =>
  import("components/shop/ImageThumbnail.vue")
);
const CategoriesList = defineAsyncComponent(() =>
  import("components/shop/CategoriesList.vue")
);
const ProductsFilters = defineAsyncComponent(() =>
  import("components/shop/ProductsFilters.vue")
);
const ProductGridItem = defineAsyncComponent(() =>
  import("components/shop/ProductGridItem.vue")
);

export default defineComponent({
  name: "Products",
  components: {
    CategoriesList,
    ProductsFilters,
    ProductGridItem,
    SkeletonProductGridItem,
    ButtonAddToCart,
    ButtonFavorite,
    ImageThumbnail,
  },

  setup() {
    const route = useRoute();
    const router = useRouter();
    const appStore = useAppStore();
    const userStore = useUserStore();
    const { isBuyer } = storeToRefs(userStore);
    const searchClient = algoliasearch(
      process.env.ALGOLIA_APP,
      process.env.ALGOLIA_PUBLIC
    );

    console.log(process.env.FIREBASE_API_KEY+" "+process.env.IMAGEKIT_PUBLIC);
    console.log(process.env.ALGOLIA_APP+" "+process.env.ALGOLIA_PUBLIC);
    const categories = ref([]);
    const products = ref([]);
    const isFilterOpen = ref(false);
    const availableFilters = ref({});
    const selectedFilters = ref([]);
    const isFetching = ref(false);
    const sortByOptions = ref([
      { value: "products", label: "SKU" },
      { value: "products_price_asc", label: "Price (lowest)" },
      { value: "products_price_desc", label: "Price (highest)" },
      { value: "featured", label: "Best Sellers", descending: true },
    ]);
    const perPageOptions = ref([20, 40, 60]);
    const queryString = window.location.search;
    var sortBy = ref({ value: "products", label: "SKU" });


    const pagination = ref({
      sortBy: "name",
      descending: false,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 0,
    });

    const fetchProducts = async () => {

      const { page, rowsPerPage } = pagination.value;

      const index = searchClient.initIndex(sortBy.value.value);

      let filterString = `(visibility:'visible')`;
      if (route.params.searchTerm) {
        filterString = `(NOT visibility:'hidden')`;
      }

      const filters = [...new Set(selectedFilters.value)]; // remove accidental duplicates...
      for (const filter of filters) {
        filterString += ` AND (filters:${filter})`;
      }

      const query = route.params.searchTerm || "";

      await index
        .search(query, {
          //filters: filterString,
          hitsPerPage: rowsPerPage,
          page: page - 1,
          facets: ["*"],
        })
        .then(async ({ facets, hits, nbPages }) => {

          // construct pagination based on existing values
          // update pagination.rowsNumber to nbPages * pagination.rowsPerPage
          availableFilters.value = facets.filters || [];

          pagination.value.rowsNumber = nbPages * rowsPerPage;

          products.value = hits;
        });

      isFetching.value = false;

      return;
    };

    // route change... reset back to default query vars, reset pagination etc.

    watch(
      [
        () => route.params.collection,
        () => route.params.category,
        () => route.params.searchTerm,
        () => route.query.page,
      ],
      async ([collection, category, searchTerm, page], [prevCollection, prevCategory, prevSearchTerm, prevPage]) => {
        // prevent watch from firing on page leave based on named routes
        const routeOptions = ["products", "search"];
        availableFilters.value = [];
        if (!route.matched.some((match) => routeOptions.includes(match.name))) {
          return;
        }

        // check if collection, category, or searchTerm has changed
        if (
          collection==null||
          collection !== prevCollection ||
          category !== prevCategory ||
          searchTerm !== prevSearchTerm ||
          page !== prevPage
        ) {
          isFetching.value = true;
          // add params and query to selectedFilters
          selectedFilters.value = [
            ...(route.query?.filters?.split(",") || []),
            ...[collection, category].filter((value) => value != null),
          ];
          // add query to pagination (but reset to page 1);
          const paginationQuery = {
            page: 1,
            ...(route.query.sortBy && { sortBy: route.query.sortBy }),
            ...(route.query.descending && { descending: route.query.descending }),
            ...(route.query.rowsPerPage && { rowsPerPage: route.query.rowsPerPage }),
          };
          pagination.value = { ...pagination.value, ...paginationQuery };

          // get categories ONLY if params.collection and not params.category
          if (collection && !category) {
            categories.value = appStore.getCategories(collection);
          } else {
            categories.value = [];
          }
          appStore.pageTitle = "Products";
          appStore.breadcrumbs = [
            {
              label: "Products",
              path: "/products",
            },
          ];

          if (searchTerm) {
            appStore.pageTitle = `Search: ${searchTerm}`;
            appStore.breadcrumbs = [
              { label: "Search", path: `/products/search` },
              { label: searchTerm, path: `/products/search/${searchTerm}` },
            ];
          } else if (collection) {
            const collectionData = appStore.getCollection(collection);
            if (collectionData) {
              appStore.pageTitle = collectionData.label;
              appStore.breadcrumbs.push({
                label: collectionData.label,
                path: `${collectionData.path}`,
              });
              if (category) {
                const categoryData = appStore.getCategory(collection, category);
                if (categoryData) {
                  appStore.pageTitle += ` - ${categoryData.label}`;
                  appStore.breadcrumbs.push({
                    label: categoryData.label,
                    path: `${categoryData.path}`,
                  });
                }
              }
            }
          }

          if (page !== prevPage) {
            pagination.value.page = parseInt(page) || 1;
          } else {
            pagination.value.page = 1;
          }

          await fetchProducts();
        }
      },
      { immediate: true, flush: "post" }
    );

    // pagination change update query vars
    const onRequest = async (requestProp) => {
      // take requestProp and update router params and query
      if (requestProp?.pagination) {
        pagination.value = requestProp.pagination;
      }

      let queryObject = { ...route.query };

      if (pagination.value.sortBy !== "name") {
        queryObject.sortBy = pagination.value.sortBy;
      }

      if (pagination.value.descending !== false) {
        queryObject.descending = pagination.value.descending;
      }

      if (pagination.value.page !== 1) {
        queryObject.page = pagination.value.page;
      } else {
        delete queryObject.page;
      }

      if (pagination.value.rowsPerPage !== 20) {
        queryObject.rowsPerPage = pagination.value.rowsPerPage;
      } else {
        delete queryObject.rowsPerPage;
      }

      router.push({ query: queryObject });
      await fetchProducts();
    };

    // filters changed
    watch(selectedFilters, (currentValue, oldValue) => {
      // TODO: failed attempt at changing url
      // const currentArray = Object.values(currentValue);
      // const oldArray = Object.values(oldValue);
      // const addedFilter = currentArray.find(
      //   (filter) => !oldArray.includes(filter)
      // );
      // const removedFilter = oldArray.find(
      //   (filter) => !currentArray.includes(filter)
      // );
      // first, check if filter is a collection or category
      // TODO: will this mess up if we go from adult/bracelets to all bracelets?
      // if removedFilter is a collection, only change if there is no category.
      // if addedFilter is a category, only change url if there is a collection.
      // tricky odd case if ?filters=bracelets changes to adult/bracelets...? (would just go to /adult?filters=bracelets...)
      let queryObject = { ...route.query };
      // strip out filters that are in url params
      const filterQuery = currentValue.filter(
        (filter) =>
          filter !== route.params.collection && filter !== route.params.category
      );


      // add all the others to the url query
      if (filterQuery.length > 0) {
        queryObject.filters = filterQuery.toString();
      } else {
        delete queryObject.filters;
      }
      // reset to page 1 because the products have changed.
      pagination.value.page = 1;
      delete queryObject.page;
      router.replace({ query: queryObject });

      if (currentValue.toString() == filterQuery.toString()) {
        router.push(`/products?filters=` + filterQuery.toString());
      }// if no collection selected then goto /products
      if (currentValue.length == 0) {
        router.push(`/`);
      }


      fetchProducts();
    });

    watch(sortBy, (currentValue) => {
      // update pagination.sortBy with value
      pagination.value.page = 1;
      fetchProducts();
    });

    const grid = ref(true);
    const columns = [
      {
        name: "image",
        label: "",
        sortable: false,
        field: "",
        align: "center",
      },
      {
        name: "products",
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
        name: "collection",
        label: "Collection / Category",
        sortable: false,
        field: (row) =>
          `${row.collection ? appStore.getCollectionLabel(row.collection) : ""
          }${row.category
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
        sortable: false,
        field: "price",
        format: (val, row) => `$${val}`,
      },
    ];

    const onRowClick = function (event, row) {
      if (event.target.nodeName === "TD") {
        // prevent calling this when clicking buttons/checkboxes/inputs...
        router.push(`s/product/${row.sku}`);
      }
    };

    return {
      isBuyer,
      isFetching,
      pagination,
      sortByOptions,
      perPageOptions,
      sortBy,
      products,
      categories,
      fetchProducts,
      isFilterOpen,
      availableFilters,
      selectedFilters,
      onRowClick,
      grid,
      columns,
      onRequest,
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

.button-group {
  display: flex;
  flex-direction: column;
}
</style>
