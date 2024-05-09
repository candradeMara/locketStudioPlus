<template>
  <router-link
    :to="`/product/${item.sku}`"
    class="product shadow-transition shadow-2"
    data-aos="zoom-in-up"
  >
    <span class="action">{{ item.name }}</span>
    <suspense>
      <image-thumbnail
        :key="item.sku"
        :sku="item.sku"
        :ratio="1"
        size="thumb"
      />
      <template #fallback>
        <q-skeleton
          class="image-skeleton"
          type="circle"
          size="180px"
          animation="fade"
        />
      </template>
    </suspense>

    <button-favorite
      :sku="item.sku"
      class="gt-xs button-favorite"
      :tooltip="false"
    />
    <button-add-to-cart
      v-if="!item.parentItem === true && !item.parent === true  && isBuyer"
      :sku="item.sku"
      class="gt-xs button-add"
      :tooltip="false"
    />
  </router-link>
</template>

<script>
import { defineAsyncComponent, defineComponent } from "vue";
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia";
import ButtonAddToCart from "components/buttons/ButtonAddToCart.vue";
import ButtonFavorite from "components/buttons/ButtonFavorite.vue";

const ImageThumbnail = defineAsyncComponent(() =>
  import("components/shop/ImageThumbnail.vue")
);

export default defineComponent({
  name: "ProductGridItem",
  components: {
    ButtonAddToCart,
    ButtonFavorite,
    ImageThumbnail,
  },
  props: {
    item: {
      required: true,
      type: Object,
    },
  },
  async setup(props) {
    const userStore = useUserStore();
    const { isBuyer } = storeToRefs(userStore);
    return { isBuyer };
  },

});
</script>

<style lang="scss" scoped>
.image-skeleton {
  height: 0;
  padding-bottom: 100%;
  position: relative;
  width: 100%;
}
.product {
  background: white;
  border-radius: 0.125rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 50px 0 0 0;
  position: relative;
  text-decoration: none;
  &:hover {
    box-shadow: $shadow-12;
    z-index: 4;
    .title {
      border-bottom: 1px solid hsla(0deg, 0%, 0%, 0.5);
      bottom: 2rem;
    }
    // .action {
    //   bottom: 5px;
    // }
    .buy,
    .favorite {
      opacity: 0.8;
    }
  }
  .product-image {
    background: white;
    // padding: 50px 0 0 0;
    transition: transform 0.25s ease-out;
  }
  .product:hover .product-image {
    transform: scale(1.1);
  }
  .title {
    border-bottom: 1px solid hsla(0deg, 0%, 0%, 0);
    color: $dark;
    font-weight: 600;
    position: absolute;
    text-align: center;

    top: 5px;
    transition: bottom 0.25s ease-out, border 0.25s ease-in;
    width: 100%;
    z-index: 4;
  }
  .action {
    color: $dark;
    font-weight: 600;
    position: absolute;
    text-align: center;
    top: 12px;
    transition: bottom 0.25s ease-out;
    width: 100%;
    z-index: 4;
  }
  .button-favorite {
    position: absolute;
    top: 5px;
    left: 5px;
    z-index: 5;
  }
  .button-add {
    color: $dark;
    position: absolute;
    top: 5px;
    right: 5px;
    z-index: 5;
  }
}
</style>
