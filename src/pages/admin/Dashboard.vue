<template>
  <div class="row q-col-gutter-md admin-cards">
    <div v-for="link in links" :key="link.name" class="col-12 col-sm-4">
      <q-card class="admin-card full-height" @click="$router.push(link.path)">
        <q-card-section>
          <div class="text-h6">{{ link.name }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none text-center">{{
          link.description
        }}</q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "AdminDashboard",
  setup() {
    const links = [
      {
        name: "New Products",
        path: "/admin/newProducts",
        description: "Edit the products on the 'New Products' Page",
      },
      {
        name: "Menu",
        path: "/admin/menu",
        description: "Edit the menu",
      },
      {
        name: "Tradeshows",
        path: "/admin/tradeshows",
        description: "Edit/Add Tradeshows",
      },
      {
        name: "Pages",
        path: "/admin/pages",
        description: "Add/Edit Page Content",
      },
      {
        name: "Users",
        path: "/admin/users",
        description: "Manage Users",
      },
    ];

    return { links };
  },
});
</script>

<style lang="scss" scoped>
.admin-cards {
  visibility: hidden;
  & > * {
    transition: opacity 0.5s ease-out;
    visibility: visible;
  }
  &:hover > * {
    opacity: 0.5;
  }
  & > *:hover {
    opacity: 1;
  }
}
.admin-card {
  border-radius: 0.25rem;
  box-shadow: $shadow-2;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.25s ease-out;
  z-index: 0;
  &::after {
    $size: 20px;
    color: #fff;
    content: "➔";
    height: $size;
    position: absolute;
    top: 5px;
    right: 5px;
    width: $size;
    z-index: 1;
  }
  &::before {
    $size: 40px;
    background: $primary;
    border-radius: $size;
    content: "";
    height: $size * 2;
    position: absolute;
    top: -1 * $size;
    right: -1 * $size;
    transition: width 0.5s ease-out, height 0.5s ease-out,
      background-color 0.5s ease-out;
    width: $size * 2;
    z-index: -1;
  }
  &:hover {
    box-shadow: $shadow-8;
    color: #fff;
    opacity: 1;
    text-shadow: 1px 1px 0px hsla(0deg, 0%, 0%, 0.5);
    &::before {
      background-color: $dark;
      height: 200%;
      width: 200%;
    }
  }
}
</style>
