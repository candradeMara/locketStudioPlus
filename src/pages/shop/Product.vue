<template>
  <q-page padding>
    <div class="row">
      <div class="col-6">
        <q-btn
          icon="favorite"
          flat
          class="favorite"
          @click="buttonAction('Added To Favorites!')"
        />
        <h2>GE341</h2>
        <p>14K Gold, Sterling Silver</p>
        <p>
          A fine pair of earrings with stunning attributes I could talk about
          for hours.
        </p>
        <div class="actions flex justify-center">
          <div class="q-mt-md row q-gutter-md">
            <q-btn filled rounded color="primary"
              >Add Engraving <small class="q-ml-sm">$20</small></q-btn
            >
            <q-btn filled rounded color="primary"
              >LocketStudio <small class="q-ml-sm">Code: E23S</small></q-btn
            >
          </div>
          <div class="add-to-cart row q-mt-md q-gutter-md">
            <q-input
              v-model.number="quantity"
              label="quantity"
              type="number"
              outlined
            />
            <q-btn
              color="dark"
              rounded
              filled
              @click="buttonAction('Added To Cart!')"
            >
              Add To Cart
            </q-btn>
          </div>
        </div>
        <div class="q-mt-md">
          <p>Product Details:</p>
          <ul>
            <li>Detail</li>
            <li>Detail</li>
            <li>Detail</li>
            <li>Detail</li>
            <li>Detail</li>
          </ul>
        </div>
        <div class="text-h5 text-center">You May Also Like</div>
        <div class="row q-gutter-sm q-mx-md">
          <router-link
            v-for="n in 4"
            :key="n"
            :to="`/shop/1/${n}`"
            exact
            class="col product-link"
          >
            <span class="title">{{ n }}</span>
            <q-img
              :src="`https://via.placeholder.com/200x200?text=category-${n}`"
              :ratio="1"
            />
          </router-link>
        </div>
      </div>
      <div class="col-6 order-first">
        <ProductGallery :images="[1, 2, 3, 4]" />
        <q-img
          :src="`https://via.placeholder.com/400x200?text=advert`"
          class="col"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
// TODO: check if item is favorited to fill in heart or not.
// TODO: move favorite button to top right, near title.
import { onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { useQuasar } from "quasar";

import ProductGallery from "components/shop/ProductGallery";

export default {
  name: "Home",
  components: {
    ProductGallery,
  },
  setup() {
    const route = useRoute();
    const sku = ref(route.params.sku);
    const store = useStore();
    const quantity = 1;

    // TODO: consider checking if product has only 1 cat and or collection and adding those to breadcrumbs?
    onBeforeMount(() => {
      // Check if last item is of type 'product' and remove it.
      const breadcrumbs = store.getters["breadcrumbs/get_breadcrumbs"];
      // TODO: this is a problem without persisted state... ????
      if (breadcrumbs.slice(-1).type === "product") {
        store.dispatch("breadcrumbs/removeBreadcrumb");
      }
      store.dispatch("breadcrumbs/addBreadcrumb", {
        to: `/shop/product/${sku.value}`,
        label: sku,
        type: "product",
      });
    });

    const $q = useQuasar();
    const buttonAction = function (text) {
      $q.notify(text);
    };
    return { quantity, buttonAction };
  },
};
</script>
<style lang="scss" scoped>
.favorite {
  position: absolute;
  top: 1rem;
  right: 1rem;
}
.product-link {
  border-radius: 0.125rem;
  box-shadow: $shadow-3;
  overflow: hidden;
  position: relative;
  transition: $shadow-transition;
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
    transition: bottom 0.25s ease-in-out;
    width: 100%;
    z-index: 444;
  }

  &:hover {
    box-shadow: $shadow-6;
    .title {
      bottom: 5px;
    }
  }
}
</style>
