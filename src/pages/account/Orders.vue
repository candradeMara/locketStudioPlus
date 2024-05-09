<template>
  <q-table ref="tableRef" v-model:pagination="pagination" title="Orders" :dense="$q.screen.lt.md" :grid="$q.screen.xs"
    :rows="orderData" :columns="columns" :loading="!orderData.length" :filter="filter" :filter-method="filterMethod"
    row-key="number" rows-per-page-label="Orders Per Page" :rows-per-page-options="[10, 20, 40, 60]"
    @request="onRequest" @row-click="onRowClick">
    <template #top-right>
      <q-input v-model="filter" borderless dense debounce="300" placeholder="Search">
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>
    <template #body-cell-total_items="props">
      <q-td :props="props">
        <span>{{ props.value }}</span>
        <q-tooltip transition-show="scale" transition-hide="scale" anchor="bottom middle" self="center middle">
          <table class="cart-table" style="min-width: 100px">
            <tbody>
              <q-tr>
                <q-td colspan="2" align="center">
                  <strong>Order Items:</strong>
                </q-td>
              </q-tr>
              <q-tr v-for="item of props.row.items" :key="item">
                <q-td>{{ item.name }}</q-td>
                <q-td>× {{ item.quantity }}</q-td>
              </q-tr>
            </tbody>
          </table>
        </q-tooltip>
      </q-td>
    </template>
    <template #body-cell-tracking="props">
      <q-td :props="props">
        <a v-if="props.row.tracking" class="btn flat" target="_blank" :href="props.row.tracking.link" @click.prevent>{{
    props.value }}</a>
      </q-td>
    </template>
  </q-table>
</template>

<script>
import { defineComponent, onBeforeMount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "stores/app";
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia";
import { date } from "quasar";
import { db } from "boot/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  startAfter,
  endBefore,
  limit,
  getDocs,
  getCountFromServer,
} from "firebase/firestore";

export default defineComponent({
  name: "Orders",
  setup() {
    const appStore = useAppStore();
    appStore.breadcrumbs = [
      {
        label: "Account",
        path: "/account",
      },
      { label: "Orders", path: "/account/orders" },
    ];
    const router = useRouter();
    const userStore = useUserStore();
    const { userData } = storeToRefs(userStore);
    let lastVisible = null;
    let firstVisible = null;
    const orderData = ref([]);
    const tableRef = ref(null);
    let initialQuery = null;
    const pagination = ref({
      sortBy: "created_at",
      descending: true,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
    });

    onBeforeMount(async () => {
      // Get total number of orders
      const accountOrderCollection = collection(
        db,
        `accounts/${userData.value.account}/orders`
      );
      if (userData.value.role == "account_admin" || userData.value.role == "marathon_admin") {
        const ordersCount = await getCountFromServer(accountOrderCollection);
        pagination.value.rowsNumber = ordersCount.data().count;
      } else {
        const userOrderQuery = query(
          accountOrderCollection,
          where("uid", "==", userData.value.uid)
        );
        const ordersCount = await getCountFromServer(userOrderQuery);
        pagination.value.rowsNumber = ordersCount.data().count;
      }
    });
    onMounted(() => {
      // get initial data from server (1st page)
      tableRef.value.requestServerInteraction();
    });

    const onRequest = async (requestProp) => {
      const { page, rowsPerPage, sortBy, descending } = requestProp.pagination;

      const ordersRef = collection(
        db,
        `accounts/${userData.value.account}/orders`
      );
      if (userData.value.role == "account_admin") {
        initialQuery = query(
          ordersRef,
          orderBy(sortBy, descending ? "desc" : "asc")
        );
      } else {
        initialQuery = query(
          ordersRef,
          where("buyer.uid", "==", userData.value.uid),
          orderBy(sortBy, descending ? "desc" : "asc")
        );
      }
      // perPage
      if (rowsPerPage > 0) {
        initialQuery = query(initialQuery, limit(rowsPerPage));
      }
      // pagination change direction
      if (page > pagination.value.page) {
        initialQuery = query(initialQuery, startAfter(lastVisible));
      } else if (page < pagination.value.page) {
        initialQuery = query(initialQuery, endBefore(firstVisible));
      }
      pagination.value = { ...requestProp.pagination };

      const querySnap = await getDocs(initialQuery);
      orderData.value = [];
      if (querySnap.docs.length > 0) {
        firstVisible = querySnap.docs[0];
        lastVisible = querySnap.docs[querySnap.docs.length - 1];
        querySnap.forEach((doc) => {
          orderData.value.push({ ...doc.data(), orderRef: doc.id });
        });
      }
    };
    const columns = [
      {
        name: "order_number",
        label: "Invoice #",
        sortable: true,
        field: "order_number",
      },
      {
        name: "customer_po",
        label: "P.O. #",
        sortable: true,
        field: "customer_po",
      },
      {
        name: "buyer",
        label: "Buyer",
        sortable: true,
        field: (row) => (row.buyer ? row.buyer.name : ""),
      },
      {
        name: "created_at",
        label: "Date Placed",
        sortable: true,
        sort: (a, b, rowA, rowB) => a.seconds - b.seconds,
        field: "created_at",
        format: (val, row) => prettyDate(val),
      },
      {
        name: "status",
        label: "Status",
        sortable: true,
        field: "status",
      },
      {
        name: "total_items",
        label: "# of Products",
        sortable: true,
        field: "total_items",
      },
      {
        name: "ship_address",
        label: "Ship To Address",
        sortable: true,
        field: (row) => (row.address ? row.address.line1 + " , " + row.address.city + ", " + row.address.state : ""),
      },
      {
        name: "tracking",
        label: "Tracking Number",
        sortable: false,
        field: (row) => (row.tracking ? row.tracking.number : ""),
      },
      {
        name: "ship_date",
        label: "Ship Date",
        sortable: true,
        field: "ship_date",
      },
    ];
    const prettyDate = (uglyDate) => {
      const test = uglyDate && uglyDate.toDate();
      if (test) {
        return date.formatDate(test, "YYYY-MM-DD");
      } else {
        return "";
      }
    };

    const onRowClick = (event, row) => {
      // go to order when clicked
      router.push(`/account/order/${row.orderRef}`);
    };
    const filter = ref("");
    // TODO: get filterMethod to work... ???
    const filterMethod = (rows, terms, cols, getCellValue) => {
      const filteredRows = rows.filter((row) => {
        return (
          row["customer_po"].toLowerCase().includes(terms.toLowerCase()) ||
          row["order_number"].toLowerCase().includes(terms.toLowerCase()) ||
          row["buyer"].toLowerCase().includes(terms.toLowerCase()) ||
          row["status"].toLowerCase().includes(terms.toLowerCase()) ||
          row["items"].toLowerCase().includes(terms.toLowerCase())
        );
      });
      return filteredRows;
    };
    return {
      tableRef,
      pagination,
      columns,
      orderData,
      onRequest,
      onRowClick,
      filter,
      filterMethod,
    };
  },
});
</script>
