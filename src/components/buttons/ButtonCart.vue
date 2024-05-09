<template>
  <q-btn to="/cart" flat round dense icon="shopping_basket">
    <q-badge v-show="cartQuantity > 0" floating>{{ cartQuantity }}</q-badge>
    <q-tooltip transition-show="scale" transition-hide="scale"
      ><template v-if="cartItems.length > 0">
        <table class="cart-table" style="min-width: 100px">
          <tbody>
            <q-tr>
              <q-td colspan="2" align="center"
                ><strong>Your Cart:</strong></q-td
              >
            </q-tr>
            <q-tr v-for="item of cartItems" :key="item">
              <q-td>{{ item.name }}</q-td>
              <q-td>× {{ item.quantity }}</q-td>
            </q-tr>
          </tbody>
        </table>
      </template>
      <template v-else>Your Cart (empty)</template>
    </q-tooltip>
  </q-btn>
</template>

<script>
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia";
import { computed } from "vue";

export default {
  name: "ButtonCart",
  setup() {
    const userStore = useUserStore();
    const { getCart } = storeToRefs(userStore);
    const cartQuantity = computed(() => {
      return getCart.value.total_items || 0;
    });
    const cartItems = computed(() => {
      return getCart.value?.items || [];
    });
    return { cartItems, cartQuantity };
  },
};
</script>
