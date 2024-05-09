<template>

  <div v-if="product === null">
    <q-spinner-oval color="primary" size="4rem" class="absolute-center" />
  </div>
  <div v-else class="row">
    <div class="col-12 col-sm-6">
      <button-favorite :sku="product.sku" />
      <h2>{{ product.name }}</h2>
      <h5 v-if="!product.children">
        <span class="label">MSRP: </span>${{ product.price }}
        <span v-if="product?.engraveData"
          >(${{ product.engraving.price + product.price }} engraved)</span
        >
      </h5>
      <div class="text-center q-mb-md">
        <span>
          <router-link :to="`/products/${product.collection}`">{{
            appStore.getCollectionLabel(product.collection)
          }}</router-link>
          /
          <router-link
            :to="`/products/${product.collection}/${product.category}`"
            >{{
              appStore.getCategoryLabel(product.collection, product.category)
            }}</router-link
          >
        </span>
        <!-- <q-btn
          :to="`/products/${product.collection}`"
          class="q-ma-xs"
          size="md"
          flat
          square
          color="dark"
          :label="appStore.getCollectionLabel(product.collection)"
        />
        <q-btn
          :to="`/products/${product.collection}/${product.category}`"
          class="q-ma-xs"
          size="md"
          flat
          square
          color="dark"
          :label="
            appStore.getCategoryLabel(product.collection, product.category)
          "
        /> -->
      </div>
      <div v-if="product.materials" class="text-center q-mb-md">
        <span>{{ product.materials.join(", ") }}</span>
      </div>
      <div v-if="product.themes" class="text-center">
        <q-btn
          v-for="theme in product.themes"
          :key="theme"
          :to="`/products/search/${theme.replace(' ', '-')}`"
          class="q-ma-xs"
          size="md"
          flat
          square
          color="dark"
        >
          {{ theme }}
        </q-btn>
      </div>
      <div class="product-notices">
        <div v-if="product.in_stock_date">
          Out of stock until: {{ prettyDate(product.in_stock_date) }}
        </div>
        <div v-if="product.lead_time">Lead Time: {{ product.lead_time }}</div>
        <div v-if="product.made_to_order">
          Made to order, turnaround time is usually very quick.
        </div>
      </div>
      <p class="text-center">
        {{ product.short_description }}
      </p>
      <p>{{ product.long_description }}</p>
      <div v-if="engraveData?.text">
        <div class="text-h6">
          Engraved: "{{ engraveData.text.join(" | ") }}"
        </div>
      </div>
      <div class="actions flex justify-center row q-gutter-md">
        <q-btn-group v-if="engraveData?.text" rounded>
          <q-btn
            filled
            rounded
            color="primary"
            :label="'Edit Engraving'"
            @click="isEngravingOpen = true"
          />
          <q-btn
            filled
            rounded
            color="primary"
            label="Remove Engraving"
            @click="engraveData = {}"
          />
        </q-btn-group>
        <q-btn
          v-else-if="product.engraving"
          filled
          rounded
          color="primary"
          :label="'Add Engraving $' + product.engraving.price"
          @click="isEngravingOpen = true"
        />
        <q-btn
          v-if="product.locket_code"
          filled
          rounded
          color="primary"
          :href="`https://locketstudio.com/?code=${product.locket_code}`"
        >
          LocketStudio Code: {{ product.locket_code }}
        </q-btn>
      </div>
      <div
        v-if="product.children && isBuyer"
        class="add-to-cart row q-mt-md justify-center"
      >
        <suspense>
          <product-children :children="product.children" />
          <template #fallback>
            <q-spinner-grid color="primary" size="4rem" />
          </template>
        </suspense>
      </div>

      <div
        v-if="product.children && isGuest"
        class="add-to-cart row q-mt-md justify-center"
      >
        <suspense>
          <product-children :children="product.children" />
          <template #fallback>
            <q-spinner-grid color="primary" size="4rem" />
          </template>
        </suspense>
      </div>



      <div
        v-else-if="!product.children && isBuyer"
        class="add-to-cart row q-mt-md justify-center"
      >
        <q-input
          v-model.number="quantity"
          label="quantity"
          type="number"
          outlined
        />
        <q-btn
          color="dark"
          filled
          :loading="isAdding"
          :label="isAdded ? 'In Cart' : 'Add To Cart'"
          @click="isAdded ? $router.push('/cart') : addToCart()"
        />
      </div>
      <div v-if="product.attributes" class="q-mt-md">
        <p>Product Details:</p>
        <ul class="attributes">
          <li v-for="attribute of product.attributes" :key="attribute">
            <span class="label">{{ attribute.label }}:</span>
            {{ attribute.values.join(", ") }}
          </li>
        </ul>
      </div>
      <suspense v-if="product.related_products">
        <product-related :key="product.sku" :items="product.related_products" />
        <template #fallback
          ><q-spinner-grid color="primary" size="4rem"
        /></template>
      </suspense>
    </div>
    <div class="col-12 col-sm-6 order-first q-pa-md">
      <suspense>
        <template #fallback>
          <q-spinner-grid color="primary" size="4rem" />
        </template>
        <product-gallery
          :key="product.sku"
          :sku="product.sku"
          :parent="product.parent ? product.parent.sku : null"
        />
      </suspense>
    </div>
    <suspense v-if="product.engraving">
      <template #fallback>
        <q-spinner-grid color="primary" size="4rem" />
      </template>
      <dialog-engraving
        v-model:isOpen="isEngravingOpen"
        v-model:engraveData="engraveData"
        :sku="product.sku"
        :engraving="product.engraving"
      />
    </suspense>
  </div>
</template>

<script>
import { defineAsyncComponent, defineComponent, ref, watch } from "vue";
import { db } from "boot/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAppStore } from "stores/app";
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia";
import ButtonFavorite from "src/components/buttons/ButtonFavorite.vue";
import ProductGallery from "components/shop/ProductGallery.vue";
import { saveEngraving } from "src/utilities/engraving.js";


const ProductChildren = defineAsyncComponent(() =>
  import("components/shop/ProductChildren.vue")
);
const DialogEngraving = defineAsyncComponent(() =>
  import("src/components/dialogs/DialogEngraving.vue")
);
const ProductRelated = defineAsyncComponent(() =>
  import("components/shop/ProductRelated.vue")
);
console.log("email:"+process.env.ORDERS_EMAIL);
export default defineComponent({
  name: "ProductSingle",
  components: {
    ButtonFavorite,
    ProductChildren,
    ProductGallery,
    DialogEngraving,
    ProductRelated,
  },
  props: {
    sku: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const userStore = useUserStore();
    const { isBuyer,isGuest } = storeToRefs(userStore);

    const appStore = useAppStore();
    const { breadcrumbs } = storeToRefs(appStore);
    const product = ref(null);
    const quantity = ref(1);
    const isAdding = ref(false);
    const isAdded = ref(false);
    const isEngravingOpen = ref(false);
    const engraveData = ref({});
    watch(
      () => props.sku,
      async (sku, oldSku) => {
        if (sku) {
          const docSnap = await getDoc(doc(db, "products", sku));
          if (docSnap.exists()) {
            product.value = docSnap.data();
            const lastBeadcrumb =
              breadcrumbs.value[breadcrumbs.value.length - 1];
            appStore.pageTitle = product.value.name;
            if (
              breadcrumbs.value.length === 0 ||
              oldSku ||
              lastBeadcrumb.type == "product"
            ) {
              breadcrumbs.value = [
                { label: "Products", path: "/products" },
                {
                  label: appStore.getCollectionLabel(product.value.collection),
                  path: `/products/${product.value.collection}`,
                },
                {
                  label: appStore.getCategoryLabel(
                    product.value.collection,
                    product.value.category
                  ),
                  path: `/products/${product.value.collection}/${product.value.category}`,
                },
              ];
            }

            // prevent adding on refresh
            breadcrumbs.value.push({
              label: product.value.name,
              path: `/product/${product.value.sku}`,
              type: `product`,
            });
          }
        }
      },
      { immediate: true }
    );
    const prettyDate = (firestoreTime) => {
      const test = firestoreTime && firestoreTime.toDate();
      if (test) {
        return date.formatDate(test, "M/D/YY");
      } else {
        return "";
      }
    };
    const addToCart = async () => {
      isAdding.value = true;
      let cartItems = [
        {
          sku: product.value.sku,
          quantity: quantity.value,
        },
      ];
      if (engraveData.value?.text) {
        // save the engraving now
        const engraving = await saveEngraving(
          engraveData.value,
          userStore.userData.account
        );
        cartItems[0].engraveData = { ...engraving };
      }

      await userStore.addToCart(cartItems);
      isAdding.value = false;
      isAdded.value = true;
    };
    return {
      isGuest,
      isBuyer,
      product,
      quantity,
      prettyDate,
      addToCart,
      isAdding,
      isAdded,
      isEngravingOpen,
      engraveData,
      appStore,
    };
  },
});
</script>
