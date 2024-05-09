<template>
  <q-item>
    <q-item-section>
      <img
        height="100"
        width="100"
        :src="`https://via.placeholder.com/100x100?text=image-${sku}`"
      />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ sku }}</q-item-label>
      <q-item-label caption>Categories...</q-item-label>
      <q-item-label caption>Metal Type(s)</q-item-label>
    </q-item-section>
    <q-item-section>
      <p>
        <em>$MSRP each</em>
      </p>
    </q-item-section>
    <q-item-section class="cart-product-actions">
      {{ quantity }}
    </q-item-section>
    <q-item-section>
      <q-btn
        icon="favorite"
        @click.prevent="buttonAction('Added to Favorites')"
      />
    </q-item-section>
    <q-item-section>$MSRP total</q-item-section>
  </q-item>
</template>

<script>
// TODO: can't v-model quantity
// Just hack it for demo purposes now...
import { ref } from "vue";
import { useQuasar } from "quasar";

export default {
  props: {
    sku: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  setup() {
    // const localQuantity = computed({
    //   get: () => {
    //     console.log("getting localQuantity " + props.quantity);
    //     return props.quantity;
    //   },
    //   set: (localQuantity) => {
    //     console.log("setting localQuantity " + localQuantity);
    //     context.emit("update:quantity", localQuantity);
    //     console.log(localQuantity);
    //   },
    // });
    const $q = useQuasar();
    const buttonAction = function (text) {
      $q.notify(text);
    };
    let localQuantity = ref(1);
    return { localQuantity, buttonAction };
  },
};
</script>
