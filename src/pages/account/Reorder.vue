<template>
  <q-page padding>
    <div class="row">
      <div class="col-2">
        <ProductsFilters />
      </div>
      <div class="products-list col-10">
        <q-table
          title="Previously Ordered"
          :rows="rows"
          :columns="columns"
          row-key="product"
          @row-click="onRowClick"
        >
          <template #body-cell-buy="props">
            <q-td :props="props">
              <q-btn
                flat
                icon="add_circle_outline"
                @click.prevent="buttonAction('Added to Cart!')"
              >
                Add To Cart</q-btn
              >
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script>
import { onBeforeMount } from "vue";
import { useStore } from "vuex";
import { useQuasar } from "quasar";
import ProductsFilters from "components/shop/ProductsFilters";

export default {
  components: {
    ProductsFilters,
  },
  setup() {
    const $q = useQuasar();
    const buttonAction = function (text) {
      $q.notify(text);
    };
    const store = useStore();
    onBeforeMount(() => {
      store.dispatch("breadcrumbs/setBreadcrumbs", [
        { to: "/account", label: "Account" },
        { to: "/account/reorder", label: "Reorder Products" },
      ]);
    });
    const columns = [
      { name: "title", label: "Product", sortable: true, field: "title" },
      {
        name: "collection",
        label: "Collection",
        sortable: true,
        field: "collection",
      },
      {
        name: "category",
        label: "Category",
        sortable: true,
        field: "category",
      },
      { name: "metal", label: "Metal(s)", sortable: true, field: "metal" },
      { name: "price", label: "MSRP", sortable: true, field: "price" },
      {
        name: "order_date",
        label: "Recently Ordered",
        sortable: true,
        field: "order_date",
      },
      { name: "buy", label: "Buy", sortable: true, field: "" },
    ];
    const rows = [
      {
        title: "GE311",
        collection: "Kiddie Kraft",
        category: "Earrings",
        metal: "14K Gold",
        price: "$135",
        order_date: "2020-04-02",
      },
      {
        title: "SB5412",
        collection: "Convertibles",
        category: "Bracelets",
        metal: "Sterling Silver",
        price: "$165",
        order_date: "2021-02-04",
      },
      {
        title: "C1451",
        collection: "Essentials",
        category: "Religious",
        metal: "Sterling Silver",
        price: "$144",
        order_date: "2020-08-04",
      },
      {
        title: "ES487",
        collection: "Kiddie Kraft",
        category: "Earrings",
        metal: "Sterling Silver",
        price: "$56",
        order_date: "2020-05-21",
      },
      {
        title: "GE981",
        collection: "Kiddie Kraft",
        category: "Earrings",
        metal: "14K Gold",
        price: "$174",
        order_date: "2020-04-19",
      },
      {
        title: "SB312",
        collection: "Convertibles",
        category: "Clasps",
        metal: "Sterling Silver",
        price: "$90",
        order_date: "2020-12-03",
      },
      {
        title: "C1671",
        collection: "Essentials",
        category: "Religious",
        metal: "Sterling Silver",
        price: "$125",
        order_date: "2020-05-15",
      },
      {
        title: "DB412",
        collection: "Essentials",
        category: "Charm Bracelets",
        metal: "Sterling Silver",
        price: "$171",
        order_date: "2020-01-03",
      },
      {
        title: "ES221",
        collection: "Kiddie Kraft",
        category: "Earrings",
        metal: "Sterling Silver",
        price: "$141",
        order_date: "2021-01-03",
      },
      {
        title: "GE611",
        collection: "Kiddie Kraft",
        category: "Earrings",
        metal: "14K Gold",
        price: "$121",
        order_date: "2019-12-31",
      },
    ];
    return { rows, columns, buttonAction };
  },
};
</script>

<style></style>
