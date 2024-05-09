<template>
  <div v-if="!getCart?.items?.length > 0">
    <q-card class="text-center absolute-center q-pa-lg">
      <h5>Empty</h5>
      <p>Your cart is currently empty.</p>
    </q-card>
  </div>
  <div v-else class="row justify-center q-col-gutter-md">
    <q-list>
      <q-item
        v-for="item in getCart.items"
        :key="item.sku"
        class="justify-center"
      >
        <suspense>
          <template #fallback>
            <skeleton-cart-item />
          </template>
          <cart-item :item="item" />
        </suspense>
      </q-item>
    </q-list>
    <div>
      <q-card class="q-mt-sm" style="position: sticky; top: 66px">
        <q-card-section>
          <div class="text-h4">Order Summary:</div>
          <div class="caption">Total Items: {{ getCart.total_items }}</div>
          <div class="caption">Total MSRP: ${{ getCart.total_price }}</div>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn
            color="primary"
            size="lg"
            to="/checkout"
            label="Checkout"
            class="self-center"
          />
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script>
// TODO: add transition effects for if a product gets removed
import { defineAsyncComponent, defineComponent } from "vue";
import { useAppStore } from "stores/app";
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia";
import SkeletonCartItem from "components/skeletons/SkeletonCartItem.vue";

const CartItem = defineAsyncComponent(() =>
  import("components/shop/CartItem.vue")
);
export default defineComponent({
  name: "Cart",
  components: {
    CartItem,
    SkeletonCartItem,
  },
  setup() {
    const appStore = useAppStore();
    appStore.breadcrumbs = [
      {
        label: "Products",
        path: "/products",
      },
      {
        label: "Cart",
        path: "/cart",
      },
    ];
    const userStore = useUserStore();
    const { getCart } = storeToRefs(userStore);
    return { getCart };
  },
});
</script>
