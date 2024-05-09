<template>
  <q-page padding>
    <h5 class="text-center">Search: {{ searchTerm }}</h5>
    <Products :products="productData" />
  </q-page>
</template>

<script>
import { ref, onBeforeMount, computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import productDataJSON from "src/assets/data/products.json";
import Products from "components/shop/Products";

export default {
  components: {
    Products,
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const searchTerm = ref(route.params.searchTerm);
    onBeforeMount(() => {
      store.dispatch("breadcrumbs/setBreadcrumbs", [
        { to: "/shop", label: "Shop" },
        {
          to: "/shop/search/term",
          label: `Search: ${searchTerm.value}`,
          type: "search",
        },
      ]);
    });
    const productData = computed(() => {
      return productDataJSON;
    });
    return { productData, searchTerm };
  },
};
</script>
