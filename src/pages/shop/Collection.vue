<template>
  <q-page padding>
    <h5 class="text-center">Categories:</h5>
    <div class="categories row q-gutter-md">
      <router-link
        v-for="n in 6"
        :key="n"
        :to="`/shop/1/${n}`"
        exact
        class="col category-link"
      >
        <span class="title">{{ n }}</span>
        <q-img
          :src="`https://via.placeholder.com/200x200?text=category-${n}`"
          :ratio="1"
        />
      </router-link>
    </div>
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
      ]);
    });
    const productData = computed(() => {
      return productDataJSON;
    });
    return { productData };
  },
};
</script>
<style lang="scss" scoped>
.category-link {
  border-radius: 0.125rem;
  box-shadow: $shadow-3;
  overflow: hidden;
  position: relative;

  &::after {
    background-image: linear-gradient(
      -45deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.2) 37%,
      rgba(255, 255, 255, 0.6) 45%,
      rgba(255, 255, 255, 0) 50%
    );
    background-position: 200% 200%, 0 0;
    background-repeat: no-repeat;
    background-size: 250% 250%;
    border-radius: 0.125rem;
    content: "";
    display: block;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    transition: background-position 0s ease-out;
    width: 100%;
    z-index: 555;
  }
  .title {
    color: $dark;
    position: absolute;
    bottom: -2rem;
    left: 5px;
    right: 5px;
    font-weight: 600;
    text-align: center;
    text-decoration: none;
    text-shadow: 1px 1px 1px hsla(0, 0, 100, 0.25);
    transition: bottom 0.5s ease-in-out;
    width: 100%;
    z-index: 444;
  }
  &:hover {
    .title {
      bottom: 5px;
    }
    &::after {
      background-position: 0 0, 0 0;
      transition-duration: 0.75s;
    }
  }
}
</style>
