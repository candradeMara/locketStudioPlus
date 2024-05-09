<template>
  <q-page padding>
    <h1>Order #: {{ order }}</h1>
    <q-list class="rounded-borders">
      <template v-for="n in 4" :key="n">
        <q-separator inset spaced />
        <OrderProductDetails
          v-model:quantity="quantity"
          v-model:sku="sku"
          clickable
          :to="`/shop/product/${n}`"
          exact
        />
      </template>
      <q-item right class="justify-center">
        <q-card class="order-summary">
          <q-card-section>
            <div class="text-h5">Order Summary</div>
          </q-card-section>
          <q-card-section>### Products</q-card-section>
          <q-card-section>Total: $534</q-card-section>
          <q-separator />
          <q-card-actions
            ><q-btn flat to="/shop/checkout"
              >Proceed to Checkout</q-btn
            ></q-card-actions
          >
        </q-card>
      </q-item>
    </q-list>
  </q-page>
</template>

<script>
import { onBeforeMount, ref } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import OrderProductDetails from "components/account/OrderProductDetails";

export default {
  components: {
    OrderProductDetails,
  },
  setup() {
    const route = useRoute();
    const order = route.params.id;

    const store = useStore();
    onBeforeMount(() => {
      store.dispatch("breadcrumbs/setBreadcrumbs", [
        { to: "/account", label: "Account" },
        { to: "/account/orders", label: "Orders" },
      ]);
    });

    let quantity = ref(1);
    let sku = "1234";
    return { order, quantity, sku };
  },
};
</script>
