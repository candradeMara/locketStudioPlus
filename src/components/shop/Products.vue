<template>
  <div class="row">
    <div class="col-2">
      <ProductsFilters />
    </div>
    <div class="products-list col-10">
      <div class="row justify-end q-gutter-md q-ma-md">
        <q-select
          v-model="perPage"
          :options="[20, 40, 60]"
          label="Products Per Page"
          filled
          style="width: 200px"
        />
        <q-select
          v-model="sortBy"
          :options="['sku', 'category', 'price (highest)', 'price (lowest)']"
          label="Products Per Page"
          filled
          style="width: 200px"
        />
        <q-btn-group flat>
          <q-btn
            flat
            icon="view_module"
            :class="'grid' === viewOption ? 'active' : ''"
            @click="viewOption = 'grid'"
          />
          <q-btn
            flat
            icon="view_list"
            :class="'details' === viewOption ? 'active' : ''"
            @click="viewOption = 'details'"
          />
        </q-btn-group>
      </div>
      <ProductsGrid v-if="viewOption == 'grid'" :products="productList" />
      <ProductsDetails v-if="viewOption == 'details'" :products="productList" />
      <q-pagination
        v-model="page"
        :max="totalPages"
        :max-pages="4"
        :direction-links="true"
        class="justify-center"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import ProductsFilters from "components/shop/ProductsFilters";
import ProductsDetails from "components/shop/ProductsDetails";
import ProductsGrid from "components/shop/ProductsGrid";

export default defineComponent({
  name: "Products",
  components: {
    ProductsFilters,
    ProductsDetails,
    ProductsGrid,
  },
  props: {
    products: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const perPage = ref(20);
    const sortBy = ref("sku");
    const viewOption = ref("grid");
    const page = ref(1);
    const totalPages = computed(() => {
      return Math.ceil(props.products.length / perPage.value);
    });
    const productList = computed(() => {
      const productStart = (page.value - 1) * perPage.value;
      const list = props.products.slice(
        productStart,
        productStart + perPage.value
      );
      return list;
    });
    return { perPage, sortBy, viewOption, page, totalPages, productList };
  },
});
</script>
<style scoped>
.q-btn.active,
.q-btn--active {
  background: #eeeeee;
}
</style>
