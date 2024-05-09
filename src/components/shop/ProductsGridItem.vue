<template>
  <router-link
    :to="`/shop/product/${product.sku}`"
    class="product shadow-transition shadow-2"
    data-aos="fade-up"
  >
    <span class="title">Product {{ product.sku }}</span>
    <span class="action">{{ action }}</span>
    <img
      :src="`https://via.placeholder.com/200x200?text=product-${product.sku}`"
      :ratio="1"
      class="product-image"
    />
    <q-btn
      flat
      round
      dense
      icon="favorite_border"
      class="favorite"
      @mouseover="action = 'Favorite'"
      @mouseout="action = 'View Details'"
      @click.prevent="buttonAction('Added to Favorites!')"
    />
    <q-btn
      flat
      round
      dense
      icon="add_circle_outline"
      class="buy"
      @mouseover="action = 'Add To Cart'"
      @mouseout="action = 'View Details'"
      @click.prevent="buttonAction('Added to Cart!')"
    />
  </router-link>
</template>

<script>
// TODO: receive product data as a prop
// add in favorites, sku, buy-now features (make them optional for other use cases)

// TODO: show text below title "Add to cart" or "Favorite" or "show details based on hover"

import { ref } from "vue";
import { useQuasar } from "quasar";

export default {
  props: {
    product: {
      type: Object,
      required: true,
    },
  },

  setup() {
    const action = ref("View Details");
    const $q = useQuasar();
    const buttonAction = function (text) {
      $q.notify(text);
    };
    return { action, buttonAction };
  },
};
</script>
<style lang="scss" scoped>
.product {
  border-radius: 0.125rem;
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
