<template>
  <q-card v-if="itemData !== null">
    <q-card-section class="justify-around text-center items-center">
      <div class="row justify-around items-center">
        <q-btn :to="`/product/${itemData.sku}`" class="q-ma-none" size="lg" flat square color="dark"
          :label="itemData.name" />
        <suspense>
          <image-thumbnail :key="itemData.sku" :sku="itemData.sku" :ratio="1" size="thumb" style="max-width: 120px" />
          <template #fallback>
            <q-skeleton type="circle" size="120px" />
          </template>
        </suspense>
      </div>
      <div class="row justify-around">
        <q-btn :to="`/products/${itemData.collection}`" class="q-ma-xs" size="md" flat square color="dark"
          :label="appStore.getCollectionLabel(itemData.collection)" />
        <q-btn :to="`/products/${itemData.path}`" class="q-ma-xs" size="md" flat square color="dark" :label="appStore.getCategoryLabel(itemData.collection, itemData.category)
    " />
      </div>
      <div v-if="itemData.materials" class="row justify-center">
        {{ itemData.materials.join(", ") }}
      </div>
    </q-card-section>
    <q-separator />
    <q-card-section horizontal class="items-center justify-around q-pa-sm">
      <q-input v-model.number="itemData.quantity" outlined class="bg-white" label="Quantity" type="number" min="1"
        style="max-width: 6rem" @update:model-value="
    addToCart([{ ...itemData, quantity: itemData.quantity }], false)
    " />
      <div>
        <div class="block text-right">
          ${{ itemData.price }} × {{ itemData.quantity }}
        </div>
        <div class="block text-right">
          <em>MSRP subtotal: </em>
          <strong> ${{ itemData.quantity * itemData.price }}</strong>
        </div>
      </div>
    </q-card-section>
    <q-separator />
    <q-card-actions align="around">
      <button-favorite :sku="item.sku" class="button-favorite" :tooltip="true" />
      <q-btn flat round color="dark" icon="delete" @click.prevent="addToCart([{ ...itemData, quantity: 0 }], false)">
        <q-tooltip>Remove Item</q-tooltip>
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script>
import { defineAsyncComponent, defineComponent, ref } from "vue";
import { useAppStore } from "stores/app";
import { useUserStore } from "stores/user";
import { db } from "boot/firebase";
import { doc, getDoc } from "firebase/firestore";
import ButtonFavorite from "../buttons/ButtonFavorite.vue";

const ImageThumbnail = defineAsyncComponent(() =>
  import("components/shop/ImageThumbnail.vue")
);

export default defineComponent({
  name: "CartItem",
  components: {
    ButtonFavorite,
    ImageThumbnail,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  async setup(props) {
    const appStore = useAppStore();
    const userStore = useUserStore();
    const { addToCart } = userStore;
    const localQuantity = ref(0);
    const itemData = ref(props.item);
    // const docSnap = await getDoc(doc(db, "products", props.item.sku));
    // if (docSnap.exists()) {
    //   itemData.value = {
    //     ...docSnap.data(),
    //     quantity: props.item.quantity,
    //     ...(props.engraveData && {
    //       price: docSnap.data().price + engraveData.price,
    //     }),
    //   };
    // }

    return {
      appStore,
      itemData,
      localQuantity,
      addToCart,
    };
  },
});
</script>
<style lang="scss"></style>
