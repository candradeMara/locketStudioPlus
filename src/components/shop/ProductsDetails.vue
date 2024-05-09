<template>
  <q-list class="rounded-borders">
    <q-separator inset spaced />
    <ProductsDetailsItem
      v-for="n in productCount"
      :key="n"
      :product="{ sku: n }"
    />
  </q-list>
</template>

<script>
import { computed } from "vue";
import ProductsDetailsItem from "components/shop/ProductsDetailsItem";

export default {
  components: {
    ProductsDetailsItem,
  },
  props: {
    products: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const productCount = computed(() => {
      return props.products.length;
    });
    const mainAction = () => {
      console.log("main clicked");
    };
    const buttonAction = () => {
      console.log("clicked");
    };
    return { productCount, mainAction, buttonAction };
  },
};
</script>
