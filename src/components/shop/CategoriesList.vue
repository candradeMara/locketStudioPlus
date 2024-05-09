<template>
  <div
    v-if="categories"
    class="categories row justify-center q-gutter-md q-mb-lg wrap"
  >
    <router-link
      v-for="category in sortedCategories"
      :key="category"
      :to="`${category.filterPath}`"
      exact
      class="category-link"
    >
      <span class="title">{{ category.label }}</span>
      <q-img :src="getCategoryImage(category.path)" :ratio="1" width="150px" />
    </router-link>
  </div>
</template>

<script>
import { defineComponent, computed } from "vue";

export default defineComponent({
  name: "CategoriesList",
  props: {
    // Array of category objects {label: String, path: String}
    // Object of category objects {bracelets: {label: String, path: String}}
    categories: { type: Object, required: true },
  },
  async setup(props) {
    const getCategoryImage = (path) => {
      const shopPath = path.replace("/products", "shop");
      return `${process.env.IMAGEKIT_URL}/${shopPath}.jpg?tr=n-cat`;
    };
    const sortedCategories = computed(() => {
      return Object.values(props.categories).sort((a, b) => {
        return a.label > b.label ? 1 : -1;
      });
    });
    return { sortedCategories, getCategoryImage };
  },
});
</script>
<style lang="scss" scoped>
.category-link {
  border-radius: 0.125rem;
  box-shadow: $shadow-3;
  overflow: hidden;
  position: relative;
  &::after {
    background-image: linear-gradient(
      -45deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.2) 37%,
      rgba(255, 255, 255, 0.6) 45%,
      rgba(255, 255, 255, 0) 50%
    );
    background-position: 200% 200%, 0 0;
    background-repeat: no-repeat;
    background-size: 250% 250%;
    border-radius: 0.125rem;
    content: "";
    display: block;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    transition: background-position 0s ease-out;
    width: 100%;
    z-index: 555;
  }
  .title {
    align-items: center;
    color: $dark;
    display: flex;
    font-weight: 600;
    height: 100%;
    justify-content: center;
    position: absolute;
    text-align: center;
    text-decoration: none;
    top: 100%;
    transition: top 0.5s ease-in-out;
    width: 100%;
    z-index: 4;
    &::before {
      background-color: hsla(0deg, 0%, 100%, 0.5);
      border-radius: 100% 100% 0 0;
      content: "";
      display: block;
      height: 100%;
      position: absolute;
      transform: scaleY(0);
      transition: transform 0.5s ease-in, border-radius 0.5s ease-out;
      width: 100%;
      z-index: -1;
    }
  }
  &:hover {
    .title {
      top: 0;
      &::before {
        border-radius: 0;
        transform: scaleY(1);
      }
    }
    &::after {
      background-position: 0 0, 0 0;
      transition-duration: 0.75s;
    }
  }
}
</style>
