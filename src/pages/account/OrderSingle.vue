<template>
  <div v-if="orderData === null">
    <q-spinner-oval color="primary" size="4rem" class="absolute-center" />
  </div>
  <template v-else>
    <q-card class="q-mb-sm">
      <q-card-section>
        <div class="text-h6">Order Summary:</div>
      </q-card-section>
      <q-card-section horizontal class="items-center justify-around q-pa-sm">
        <q-card-section>
          <div class="text-caption">Order: {{ orderData?.order_number || '' }}</div>
          <div class="text-caption">Status: {{ orderData?.status || '' }}</div>
          <div class="text-caption">Buyer: {{ orderData?.buyer?.name || '' }}</div>
          <div class="text-caption">
            Tracking:
            <a :href="trackingUrl" target="_blank" class="text-caption">
              {{ orderData?.tracking?.number || '' }}
            </a>
          </div>
          <div class="text-caption">Carrier: {{ orderData?.tracking?.carrier || '' }}</div>
        </q-card-section>
        <q-card-section>
          <div class="text-caption">Placed: {{ prettyDate }}</div>
          <div class="text-caption">Total Items: {{ orderData?.total_items || '' }}</div>
          <div class="text-caption">Total MSRP: ${{ orderData?.total_price || '' }}</div>
          <div class="text-caption"> Ship To Address: {{ formatAddress(orderData?.address) }}</div>
        </q-card-section>
      </q-card-section>
    </q-card>
    <q-table
:rows="orderData.items" :columns="columns" rows-per-page-label="Items Per Page"
      :rows-per-page-options="[20, 40, 60]" row-key="name" @row-click="onRowClick">
      <template #body-cell-image="{ row }">
        <q-td style="padding: 0">
          <suspense>
            <image-thumbnail :sku="row.sku" :ratio="1" size="thumb" style="margin-left: 1rem" />
            <template #fallback>
              <q-skeleton class="image-skeleton" square animation="fade" />
            </template>
          </suspense>
        </q-td>
      </template>
      <template #body-cell-actions="{ row }">
        <q-td>
          <div class="row">
            <q-btn-group stretch flat>
              <button-favorite :sku="row.sku" />
              <button-add-to-cart :sku="row.sku" />
            </q-btn-group>
          </div>
        </q-td>
      </template>
      <template #bottom-row>
        <q-tr>
          <q-td colspan="3"></q-td>
          <q-td align="right">Total:</q-td>
          <q-td align="center"><strong>{{ orderData.total_items }}</strong></q-td>
          <q-td align="right"><strong>${{ orderData.total_price }}</strong></q-td>
        </q-tr>
      </template></q-table>
  </template>
</template>

<script>
// TODO:make mobile version... closer to cartTable cards
import {
  computed,
  defineAsyncComponent,
  defineComponent,
  ref,
  watch,
} from "vue";
import { date } from "quasar";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "stores/app";
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia";
import { db } from "boot/firebase";
import { doc, getDoc } from "firebase/firestore";
import ButtonAddToCart from "src/components/buttons/ButtonAddToCart.vue";
import ButtonFavorite from "src/components/buttons/ButtonFavorite.vue";

const ImageThumbnail = defineAsyncComponent(() =>
  import("components/shop/ImageThumbnail.vue")
);

export default defineComponent({
  name: "OrderSingle",
  components: {
    ButtonAddToCart,
    ButtonFavorite,
    ImageThumbnail,
  },
  setup() {
    const appStore = useAppStore();
    appStore.breadcrumbs = [
      {
        label: "Account",
        path: "/account",
      },
      { label: "Orders", path: "/account/orders" },
    ];
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    const { userData } = storeToRefs(userStore);
    const orderData = ref(null);
    const prettyDate = computed(() => {
      const pretty = date.formatDate(
        orderData.value.created_at.toDate(),
        "MMMM Do, YYYY"
      );
      return pretty;
    });
    const columns = [
      {
        name: "image",
        label: "",
        sortable: false,
        field: "",
        align: "center",
      },
      {
        name: "name",
        label: "Product",
        sortable: true,
        field: "name",
        align: "center",
      },
      {
        name: "actions",
        label: "",
        sortable: false,
        field: "",
        align: "center",
      },
      {
        name: "collection",
        label: "Collection / Category",
        sortable: true,
        field: (row) =>
          `${row.collection ? appStore.getCollectionLabel(row.collection) : ""
          }${row.category
            ? " / " + appStore.getCategoryLabel(row.collection, row.category)
            : ""
          }`,
      },
      {
        name: "materials",
        label: "Metal(s)",
        sortable: true,
        field: "materials",
        format: (val, row) => (val ? val.join(", ") : ""),
        align: "left",
      },
      {
        name: "price",
        label: "MSRP",
        sortable: true,
        field: "price",
        format: (val, row) => `$${val}`,
      },
      {
        name: "quantity",
        label: "Quantity",
        sortable: true,
        field: "quantity",
        align: "center",
      },
      {
        name: "subtotal",
        label: "Subtotal",
        sortable: true,
        field: (row) => `$${row.price * row.quantity}`,
        align: "right",
      },
    ];
    const footerProps = [
      {
        name: "quantity",
        label: "qty",
        align: "right",
        field: "quantity",
      },
      {
        name: "subtotal",
        label: "subtotal",
        align: "right",
        field: "subtotal",
        format: (val) => `$${val.toFixed(2)}`,
      },
    ];
    const onRowClick = (event, row) => {
      if (event.target.nodeName === "TD") {
        router.push(`/product/${row.sku}`);
      }
    };
    watch(
      () => route.params,
      async (params) => {
        if (params.id) {
          const docSnap = await getDoc(
            doc(db, `accounts/${userData.value.account}/orders`, params.id)
          );
          if (docSnap.exists()) {
            orderData.value = docSnap.data();
            const orderNumber = orderData.value.order_number || route.params;
            appStore.pageTitle = `Order: ${orderNumber}`;
            appStore.breadcrumbs.push({
              label: `Order: ${orderNumber}`,
              path: `/account/order/${orderNumber}`,
            });
          }
        }
      },
      { immediate: true }
    );
    return {
      prettyDate,
      orderData,
      columns,
      footerProps,
      onRowClick,
    };
  },
  computed: {
    trackingUrl() {
      if (this.orderData?.tracking && this.orderData.tracking.number) {
        const trackingNumber = this.orderData.tracking.number;

        const carrier = this.orderData.tracking.carrier;
        // FedEx tracking URL
        const lowerCaseDescription = carrier.toLowerCase();

        // FedEx tracking URL
        if (lowerCaseDescription.includes('fedex')) {
          return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}`;
        }

        // USPS tracking URL
        if (lowerCaseDescription.includes('usps') || lowerCaseDescription.includes('us mail')) {
          return `https://tools.usps.com/go/TrackConfirmAction?tRef=fullpage&tLc=2&text28777=&tLabels=${trackingNumber}`;
        }

        // Default to UPS tracking URL for other cases
        return `https://www.ups.com/track?tracknum=${trackingNumber}`;

      } else {
        return '';
      }

    }
  },
  methods: {
    formatAddress(address) {
      if (!address) return '';
      const { line1, city, state, zipcode } = address;
      return `${line1}, ${city}, ${state}, ${zipcode}`;
    }
  }
});

</script>
