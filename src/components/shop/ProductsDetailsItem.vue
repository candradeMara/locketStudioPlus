<template>
  <q-item
    clickable
    :to="`/shop/product/${product.sku}`"
    exact
    data-aos="flip-up"
  >
    <q-item-section>
      <q-btn
        flat
        icon="favorite_outline"
        @click.prevent="buttonAction('Added to Favorites!')"
      />
    </q-item-section>
    <q-item-section>
      <img
        height="100"
        width="100"
        :src="`https://via.placeholder.com/100x100?text=image-${product.sku}`"
      />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ product.sku }}</q-item-label>
      <q-item-label caption>Categories...</q-item-label>
      <q-item-label caption>Metal Type(s)</q-item-label>
    </q-item-section>
    <q-item-section>
      <p><em>MSRP</em></p>
    </q-item-section>
    <q-item-section right>
      <q-btn
        flat
        icon="add_circle_outline"
        @click.prevent="buttonAction('Added to Cart!')"
      >
        Add To Cart</q-btn
      >
    </q-item-section>
  </q-item>
  <q-separator inset spaced />
</template>

<script>
// TODO: redesign sections
// TODO: don't include separator for last ?

import { useQuasar } from "quasar";

export default {
  props: {
    product: {
      type: Object,
      required: true,
    },
  },

  setup() {
    const $q = useQuasar();
    const buttonAction = function (text) {
      $q.notify(text);
    };
    return { buttonAction };
  },
};
</script>
<style lang="scss" scoped>
.product {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  text-decoration: none;
  &:hover {
    box-shadow: $shadow-12;
    .title {
      border-bottom: 1px solid hsla(0, 0, 0, 0.5);
      bottom: 2rem;
    }
    .action {
      bottom: 5px;
    }
    .buy,
    .favorite {
      opacity: 0.8;
    }
  }
}
.title {
  border-bottom: 1px solid hsla(0, 0, 0, 0);
  color: $dark;
  position: absolute;
  bottom: 5px;
  left: 10px;
  font-weight: 600;
  transition: bottom 0.25s ease-out, border 0.25s ease-in;
  z-index: 444;
}
.action {
  color: $dark;
  position: absolute;
  bottom: -2rem;
  left: 10px;
  font-weight: 400;
  transition: bottom 0.25s ease-out;
  z-index: 444;
}
.product img {
  // TODO: tmp while using placeholder
  opacity: 0.25;
  transition: transform 0.25s ease-out;
}
.product:hover img {
  transform: scale(1.4);
}
.buy,
.favorite {
  color: $dark;
  opacity: 0.25;
  position: absolute;
  top: 5px;
  right: 5px;
  transition: transform 0.25s ease-in, opacity 0.25s ease-in;
}
.favorite {
  left: 5px;
}
</style>
