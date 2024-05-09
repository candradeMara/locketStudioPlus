<template>
  <q-table :rows="childrenData" :columns="columns" :hide-pagination="true" :pagination="{ rowsPerPage: 1000 }"
    row-key="name" @row-click="onRowClick">
    <template #header-cell-quantity>
      <th>
        <q-btn-group spread>
          <q-btn color="dark" dark label="- ALL" :disabled="cartItems.length < 1" @click="changeAllQuantities(-1)" />
          <q-separator vertical dark />
          <q-btn color="dark" dark label="+ ALL" @click="changeAllQuantities(1)" />
        </q-btn-group>
      </th>
    </template>
    <template #body-cell-quantity="{ row }">
      <q-td>
        <q-input v-model.number="row.quantity" label="quantity" type="number" outlined />
      </q-td>
    </template>

    <template v-if="!isGuest" #bottom>

      <q-btn color="dark" filled :loading="isAdding" :disabled="cartItems.length < 1"
        :label="isAdded ? 'In Cart' : 'Add To Cart'" style="margin: 0 auto"
        @click="isAdded ? $router.push('/cart') : addToCart()" />
    </template>
  </q-table>
</template>

<script>
// component specifically for displaying children products on a parent product page.
import { computed, defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "stores/user";
import { db } from "boot/firebase";
import { doc, getDoc } from "firebase/firestore";
import { storeToRefs } from "pinia";




export default defineComponent({
  name: "ProductChildren",
  props: {
    // currently an object, but changing to array of skus
    children: {
      type: Array,
      required: true,
    },
  },
  async setup(props) {
    const router = useRouter();
    const userStore = useUserStore();
    const childrenData = ref([]);
    const isAdding = ref(false);
    const isAdded = ref(false);
    const { isBuyer, isGuest } = storeToRefs(userStore);
    ;
    const onRowClick = (event, row) => {
      if (event.target.nodeName === "TD") {
        router.push(`/product/${row.sku}`);
      }
    };
    if (typeof props.children[0] === "string") {
      console.log("string found");
      const promises = props.children.map(async (sku) => {
        await getDoc(doc(db, `products/${sku}`)).then((docSnap) => {
          if (docSnap.exists()) {
            childrenData.value.push({ ...docSnap.data(), quantity: 0 });
          }
        });
      });
      await Promise.all(promises);
    } else {
      childrenData.value = [
        ...props.children.map((item) => {
          return { ...item, quantity: 0 };
        }),
      ];
    }

    // sort products by sku.
    childrenData.value.sort((a, b) => (a.sku < b.sku ? -1 : 1));
    const cartItems = computed(() => {
      return childrenData.value.filter((child) => child.quantity > 0);
    });
    const columns = [
      {
        name: "name",
        label: "Product",
        sortable: true,
        field: "name",
        align: "center",
      },
      {
        name: "price",
        label: "MSRP",
        sortable: true,
        field: "price",
        align: "right",
        format: (val, row) => `$${val}`,
      },
      {
        name: "quantity",
        label: "Quantity",
        sortable: false,
        field: "",
        align: "center",
      },
    ];
    const changeAllQuantities = (amount) => {
      childrenData.value = childrenData.value.map((child) => {
        return { ...child, quantity: Math.max(child.quantity + amount, 0) };
      });
    };
    const addToCart = async () => {
      isAdding.value = true;
      await userStore.addToCart(cartItems.value);
      isAdding.value = false;
      isAdded.value = true;
    };
    return {
      childrenData,
      columns,
      cartItems,
      onRowClick,
      changeAllQuantities,
      addToCart,
      isAdding,
      isAdded,
      isGuest,
      isBuyer
    };
  },
});
</script>
