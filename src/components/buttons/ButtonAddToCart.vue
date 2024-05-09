<template>
  <q-btn flat round color="dark" class="add-to-cart" :loading="isAdding" :class="inCart ? 'is-added' : ''"
    :icon="inCart ? 'check_circle' : 'shopping_basket'" @click.prevent="inCart ? $router.push('/cart') : add()">
    <q-tooltip v-if="tooltip">{{
    inCart ? "Go To Cart" : "Add To Cart"
  }}</q-tooltip>
  </q-btn>
</template>

<script>
import { computed, defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "stores/user";

export default defineComponent({
  name: "ButtonAddToCart",
  props: {
    sku: {
      type: String,
      required: true,
    },
    tooltip: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const userStore = useUserStore();
    const isAdding = ref(false);
    console.log("cache test");
    const inCart = computed(() => {
      return userStore.isInCart(props.sku);
    });
    const add = async () => {
      // check if item is in cart, if so, go to cart instead of adding again...
      if (inCart.value) {
        router.push("/cart");
      }
      isAdding.value = true;
      const cartItems = [
        {
          sku: props.sku,
          quantity: 1,
        },
      ];
      await userStore.addToCart(cartItems);
      isAdding.value = false;
    };
    return { inCart, isAdding, add };
  },
});
</script>
