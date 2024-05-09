<template>
  <q-page>
    <div>
      <h5 class="text-center">What's New</h5>
      <ProductsCarousel :total-slides="24" />
    </div>
    <div class="flex flex-center q-gutter-md items-center q-mt-md">
      <router-link v-for="n in 7" :key="n" :to="`/shop/${n}`"
        ><img
          :src="`https://via.placeholder.com/400x200?text=collection-${n}`"
          :ratio="2"
      /></router-link>
    </div>
    <div class="flex flex-center q-gutter-md items-center q-mt-md">
      <q-img
        :src="`https://via.placeholder.com/800x300?text=advert-space`"
        :ratio="8 / 3"
      />
    </div>
    <div>
      <h5 class="text-center">
        <router-link to="/account/favorites">Your Favorites</router-link>
      </h5>
      <ProductsCarousel :total-slides="16" />
    </div>
  </q-page>
</template>
<script>
import { onBeforeMount } from "vue";
import ProductsCarousel from "components/shop/ProductsCarousel";
import { useStore } from "vuex";

export default {
  components: {
    ProductsCarousel,
  },
  setup() {
    const store = useStore();
    onBeforeMount(() => {
      store.dispatch("breadcrumbs/setBreadcrumbs", [
        { to: "/shop", label: "Shop" },
      ]);
    });
    return {};
  },
};
</script>
<style lang="scss"></style>
