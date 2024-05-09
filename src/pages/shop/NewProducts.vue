<template>
  <div v-if="collections === {}">
    <q-spinner-oval color="primary" size="4rem" class="absolute-center" />
  </div>
  <div v-else>
    <div
      v-for="collection in collections"
      :key="collection"
      class="row col-12 justify-center"
    >
      <h6>
        <router-link :to="`/products/${collection[0].collection}`">{{
          appStore.getCollectionLabel(collection[0].collection)
        }}</router-link>
        /
        <router-link
          :to="`/products/${collection[0].collection}/${collection[0].category}`"
          >{{
            appStore.getCategoryLabel(
              collection[0].collection,
              collection[0].category
            )
          }}</router-link
        >
      </h6>
      <div class="row col-12 q-col-gutter-sm justify-center">
        <div
          v-for="item in collection"
          :key="item"
          class="col-xs-6 col-sm-3 col-md-2 col-lg-2"
        >
          <suspense>
            <template #fallback><skeleton-product-grid-item /></template>
            <product-grid-item :item="item" />
          </suspense>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, defineAsyncComponent, onBeforeMount, ref } from "vue";
import { useAppStore } from "stores/app";
import { db } from "boot/firebase";
import { doc, getDoc } from "firebase/firestore";
import SkeletonProductGridItem from "components/skeletons/SkeletonProductGridItem.vue";

const ProductGridItem = defineAsyncComponent(() =>
  import("components/shop/ProductGridItem.vue")
);
export default defineComponent({
  name: "NewProducts",
  components: {
    ProductGridItem,
    SkeletonProductGridItem,
  },
  setup() {
    const appStore = useAppStore();
    const productData = ref([]);
    const collections = ref([]);
    onBeforeMount(async () => {
      await getDoc(doc(db, "app/newItems")).then(async (itemsDocSnap) => {
        appStore.pageTitle = "New Products";
        appStore.breadcrumbs = [
          {
            label: "Products",
            path: "/products",
          },
          { label: "New", path: "/products/new" },
        ];
        const newItems = itemsDocSnap.data()?.items;
        if (Array.isArray(newItems) && newItems.length > 0) {
          const filteredItems = newItems.filter((sku) => {
            return !productData.value.find((item) => {
              return item.sku === sku;
            });
          });

          const promises = filteredItems.map(async (sku) => {
            const docSnap = await getDoc(doc(db, `products/${sku}`));
            if (docSnap.exists()) {
              productData.value.push({ ...docSnap.data(), quantity: 0 });
            }
          });

          await Promise.all(promises);
          collections.value = Object.values(productData.value).reduce(
            (result, item) => {
              const { collection, category } = item;
              const key = `${collection}/${category}`;
              if (!result[key]) {
                result[key] = [];
              }
              result[key].push(item);
              return result;
            },
            {}
          );
        }
      });
    });
    return { appStore, collections };
  },
});
</script>
