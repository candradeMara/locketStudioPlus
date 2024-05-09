<template>
  <q-page padding>
    <Products :products="productData" />
  </q-page>
</template>

<script>
import { onBeforeMount, computed } from "vue";
import { useStore } from "vuex";
import productDataJSON from "src/assets/data/products.json";
import Products from "components/shop/Products";

export default {
  components: {
    Products,
  },
  setup() {
    const store = useStore();
    onBeforeMount(() => {
      // TODO: fill with params
      store.dispatch("breadcrumbs/setBreadcrumbs", [
        { to: "/shop", label: "Shop" },
        { to: "/shop/collection", label: "Collection", type: "collection" },
        {
          to: "/shop/collection/category",
          label: "Category",
          type: "category",
        },
      ]);
    });
    const productData = computed(() => {
      return productDataJSON;
    });
    return { productData };
  },
};
</script>
