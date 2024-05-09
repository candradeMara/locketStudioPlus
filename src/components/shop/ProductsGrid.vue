<template>
  <ul class="products-grid q-gutter-md row wrap unstyled justify-center">
    <li v-for="n in productCount" :key="n" class="">
      <ProductsGridItem :product="{ sku: n }" />
    </li>
  </ul>
</template>

<script>
import { computed } from "vue";
import ProductsGridItem from "components/shop/ProductsGridItem";

export default {
  components: {
    ProductsGridItem,
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
    return { productCount };
  },
};
</script>

<style lang="scss">
.products-grid {
  list-style-type: none;
  li {
    list-style-type: none;
  }
}
</style>
