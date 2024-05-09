div
<template>
  <div v-if="orderNumber !== null">
    <q-card class="text-center absolute-center q-pa-lg">
      <q-card-section>Order #</q-card-section>
      <q-card-section
        ><em>{{ orderNumber }}</em></q-card-section
      >
      <q-card-section>was successfully placed</q-card-section>
    </q-card>
  </div>
  <div v-else-if="order.items" class="row justify-center q-col-gutter-md">
    <div class="col-12 col-md-6 q-gutter-y-md">
      <h4>Account: #{{ userData.account }}</h4>
      <h5>User: {{ userData.name }}</h5>
      <q-select
        v-model="order.shipping"
        outlined
        class="bg-white"
        :options="['Ground', '3-Day', '2-Day', 'Overnight']"
        label="Shipping Method"
      />
      <div class="text-h6">Shipping Location</div>
      <div v-if="order.address" class="address">
        <div class="text-subtitle">{{ order.address.name }}</div>
        <div class="text-subtitle2">{{ order.address.line1 }}</div>
        <div class="text-subtitle2">{{ order.address.line2 }}</div>
        <div class="text-subtitle2">
          {{ order.address.city }}, {{ order.address.state }}
          {{ order.address.zipcode }}
        </div>
        <q-checkbox
          v-if="
            Array.isArray(getAddresses) &&
            getAddresses.length > 1 &&
            order.address
          "
          :model-value="addressIsPreferred"
          label="Set as preferred"
          @click="setPreferred"
        />
      </div>
      <template v-if="Array.isArray(getAddresses) && getAddresses.length > 1">
        <q-btn
          label="Use Another Address"
          @click="isSelectAddressOpen = true"
        />
        <suspense>
          <address-list
            v-model:is-open="isSelectAddressOpen"
            v-model:selected="order.address"
            :account="userData.account"
          />
          <template #fallback>
            <q-spinner-grid color="primary" size="4rem" class="" />
          </template>
        </suspense>
      </template>
      <q-input
        v-model="order.customer_po"
        outlined
        class="bg-white"
        label="Customer P.O. (optional)"
      />
      <q-input
        v-model="order.notes"
        outlined
        class="bg-white"
        label="Order Notes"
        type="textarea"
      />
    </div>
    <div>
      <q-card class="q-mt-sm" style="position: sticky; top: 66px">
        <q-card-section>
          <div class="text-h4">Order Summary:</div>
          <div class="caption">Total Items: {{ order.total_items }}</div>
          <div class="caption">Total MSRP: ${{ order.total_price }}</div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            color="primary"
            size="lg"
            label="Place Order"
            class="self-center"
            :loading="isOrdering"
            @click="placeOrder()"
          />
        </q-card-actions>
      </q-card>
    </div>
  </div>
  <div v-else>
    <q-card class="text-center absolute-center q-pa-lg">
      <h5>Empty</h5>
      <p>Your cart is currently empty.</p>
    </q-card>
  </div>
</template>

<script>
import {
  computed,
  defineAsyncComponent,
  defineComponent,
  onBeforeMount,
  ref,
} from "vue";
import { useAppStore } from "stores/app";
import { useAccountStore } from "stores/account";
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia";
import { db } from "boot/firebase";
import {
  collection,
  doc,
  addDoc,
  serverTimestamp,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const AddressList = defineAsyncComponent(() =>
  import("components/account/AddressList.vue")
);

export default defineComponent({
  name: "Checkout",
  components: {
    AddressList,
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
      { label: "Checkout", path: "/checkout" },
    ];
    const accountStore = useAccountStore();
    const { getAddresses } = storeToRefs(accountStore);
    const userStore = useUserStore();
    const { getCart, userData } = storeToRefs(userStore);
    const orderNumber = ref(null);
    const isOrdering = ref(false);
    const isSelectAddressOpen = ref(false);
    const order = ref({
      ...getCart.value,
      account: userData.value.account,
      method: "web",
      buyer: {
        email: userData.value.email,
        name: userData.value.name,
        uid: userData.value.uid,
        account: userData.value.account,
      },
      shipping: "Ground",
      notes: "",
      customer_po: "",
      address: userData.value.address_preferred || {},
      order_number: "pending",
      status: "placed",
    });

    onBeforeMount(async () => {
      // check if there is only 1 address for account and set order address to that.
      if (
        Array.isArray(getAddresses.value) &&
        getAddresses.value.length === 1
      ) {
        order.value.address = getAddresses.value[0];
      }
    });

    const addressIsPreferred = computed(() => {
      return (
        JSON.stringify(order.value.address) ===
        JSON.stringify(userData.value.address_preferred)
      );
    });
    const setPreferred = async () => {
      await setDoc(
        doc(
          db,
          `accounts/${userData.value.account}/users/${userData.value.uid}`
        ),
        { address_preferred: { ...order.value.address } },
        { merge: true }
      );
    };

    const placeOrder = async () => {
      isOrdering.value = true;
      ///// PLACE ORDER //////

      await addDoc(
        collection(db, `accounts/${userData.value.account}/orders`),
        {
          ...order.value,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        }
      ).then(async (orderDoc) => {
        orderNumber.value = orderDoc.id;
        order.value.id = orderDoc.id;
        // // create duplicate under account/orders...
        // await setDoc(
        //   doc(db, `accounts/${userData.value.account}/orders/${orderDoc.id}`),
        //   {
        //     ...order.value,
        //     created_at: serverTimestamp(),
        //     updated_at: serverTimestamp(),
        //   }
        // );
        // clear cart
        await updateDoc(
          doc(
            db,
            `accounts/${userData.value.account}/users/${userData.value.uid}`
          ),
          { cart: [] }
        );
      });

      isOrdering.value = false;
    };
    return {
      getAddresses,
      isSelectAddressOpen,
      order,
      orderNumber,
      isOrdering,
      getCart,
      userData,
      addressIsPreferred,
      setPreferred,
      placeOrder,
    };
  },
});
</script>
