<template>
  <div v-if="relatedProducts.length > 0">
    <hr />
    <h5>You May Also Like:</h5>
    <div class="related-products col">
      <suspense v-for="relatedProduct of relatedProducts" :key="relatedProduct">
        <template #fallback><skeleton-product-grid-item /></template>
        <product-grid-item :item="relatedProduct" />
      </suspense>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent, defineComponent, ref } from "vue";
import { db } from "boot/firebase.js";
import {
  documentId,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import SkeletonProductGridItem from "../skeletons/SkeletonProductGridItem.vue";

const ProductGridItem = defineAsyncComponent(() =>
  import("components/shop/ProductGridItem.vue")
);

export default defineComponent({
  name: "ProductRelated",
  components: {
    ProductGridItem,
    SkeletonProductGridItem,
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  async setup(props) {
    const relatedProducts = ref([]);
    const q = query(
      collection(db, "products"),
      where(documentId(), "in", props.items)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      relatedProducts.value.push(doc.data());
    });
    return { relatedProducts };
  },
});
</script>
<style lang="scss" scoped>
.related-products {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  grid-template-rows: 1fr;
  column-gap: 1rem;
  row-gap: 1rem;
  place-items: center;
  .product {
    margin: 1rem;
    max-width: 200px;
    width: 100%;
  }
}
</style>
