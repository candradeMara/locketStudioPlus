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
        {{ appStore.getCollectionLabel(collection[0].collection) }}
        /
        {{
          appStore.getCategoryLabel(
            collection[0].collection,
            collection[0].category
          )
        }}
      </h6>
      <div class="row col-12 q-col-gutter-sm justify-center">
        <div
          v-for="item in collection"
          :key="item"
          class="col-xs-6 col-sm-3 col-md-2 col-lg-2"
        >
          <suspense>
            <template #fallback><skeleton-product-grid-item /></template>
            <new-product :item="item" @delete="deleteItem" />
          </suspense>
        </div>
      </div>
    </div>
  </div>
  <q-btn label="Add Product" @click="isSearchOpen = true" />
  <dialog-search
    v-model:is-open="isSearchOpen"
    placeholder="SKU"
    only-skus
    :search-default="false"
    @search="addItem"
  />
</template>

<script>
import {
  defineComponent,
  defineAsyncComponent,
  onBeforeMount,
  onBeforeUnmount,
  ref,
} from "vue";
import { useAppStore } from "stores/app";
import { db } from "boot/firebase";
import {
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "@firebase/firestore";
import DialogSearch from "components/dialogs/DialogSearch.vue";
import SkeletonProductGridItem from "components/skeletons/SkeletonProductGridItem.vue";

const NewProduct = defineAsyncComponent(() =>
  import("components/admin/NewProduct.vue")
);

export default defineComponent({
  name: "AdminNewProducts",
  components: { NewProduct, DialogSearch, SkeletonProductGridItem },
  setup() {
    const appStore = useAppStore();
    const collections = ref([]);
    const productData = ref([]);
    const isSearchOpen = ref(false);
    let snapshotListenerUnsubscribe = null;
    onBeforeMount(async () => {
      snapshotListenerUnsubscribe = onSnapshot(
        doc(db, "app/newItems"),
        async (snapshot) => {
          const newItems = snapshot.data()?.items;
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
        }
      );
    });

    onBeforeUnmount(() => {
      if (snapshotListenerUnsubscribe) {
        snapshotListenerUnsubscribe();
      }
    });

    const addItem = (sku) => {
      console.log(sku);
      updateDoc(doc(db, "app/newItems"), { items: arrayUnion(sku) });
    };

    const deleteItem = (sku) => {
      updateDoc(doc(db, "app/newItems"), { items: arrayRemove(sku) });
    };

    return {
      addItem,
      isSearchOpen,
      deleteItem,
      collections,
      appStore,
    };
  },
});
</script>
