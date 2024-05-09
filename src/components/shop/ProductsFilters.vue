<template>
  <h5>Filters:</h5>
  <div class="filters-selected">
    <q-chip
      v-for="chip in selectedFiltersFormat"
      v-show="
        (chip.label !== 'Collection' || showCollections) &&
        (chip.label !== 'Category' || showCategories)
      "
      :key="chip.slug"
      removable
      color="primary"
      text-color="white"
      :label="chip.label"
      @remove="removeFilterBySlug(chip.slug)"
    />
  </div>
  <q-list class="filters-list">
    <template v-for="group in filterGroups" :key="group">
      <q-expansion-item
        v-show="
          (group.label !== 'Collection' || showCollections) &&
          (group.label !== 'Category' || showCategories)
        "
        expand-separator
        default-opened
        :label="group.label"
        :content-inset-level="0"
      >
        <q-list v-for="filter in group.filters" :key="filter" dense>
          <q-item tag="label">
            <q-item-section>
              <q-checkbox
                :model-value="selectedFilters"
                :val="filter.slug"
                :label="`${filter.label}`"
                dense
                @update:model-value="
                  (value) => $emit('update:selectedFilters', value)
                "
              />
            </q-item-section>
            <q-item-section v-if="filter.count" side>
              {{ `(${filter.count})` }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
      <q-separator />
    </template>
  </q-list>
</template>

<script>
import { computed, defineComponent } from "vue";
import { useAppStore } from "stores/app";
import { storeToRefs } from "pinia";

/**
 * Takes an array of filter slugs and an array of available filters
 * Organizes them into groups and outputs a selectable view
 */
export default defineComponent({
  name: "ProductsFilters",
  props: {
    selectedFilters: {
      type: Array,
      required: true,
    },
    // Object of {slug: quantity}
    availableFilters: {
      type: Object,
      required: true,
    },
    showCollections: {
      type: Boolean,
      default: false,
    },
    showCategories: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:selectedFilters"],
  async setup(props, { emit }) {
    const appStore = useAppStore();
    const { getFilter } = storeToRefs(appStore);

    const removeFilterBySlug = (slug) => {
      //emit change to selectedFilters
      // remove before emitting
      const updated = [...props.selectedFilters].filter(
        (filter) => filter !== slug
      );
      emit("update:selectedFilters", updated);
    };
    const selectedFiltersFormat = computed(() => {
      // reformat selected into format [{label: '', slug: ''}]
      return [...props.selectedFilters]
        .map((slug) => {
          return { label: getFilter.value(slug).label, slug: slug };
        })
        .filter((e) => {
          return e !== undefined;
        });
    });
    const filterGroups = computed(() => {
      // Map over the keys of the available filters object and return an array of filters that have been filtered
      // by the getFilter() function and have the required properties for each filter added.
      const allFilters = Object.keys(props.availableFilters)
        .map((filterKey) => {
          const filter = getFilter.value(filterKey);
          if (filter) {
            return {
              label: filter.label,
              group: filter.group,
              slug: filterKey,
              count: props.availableFilters[filterKey],
            };
          }
        })
        .filter((n) => n);

      // Reduce the allFilters array into a groups array, where each group contains a label and filters array.
      // If the group already exists, add the current filter to its filters array.
      // If the group does not exist, create a new group object with the label and filters array.
      const groups = allFilters.reduce((groups, filter) => {
        const existingGroup = groups.find(
          (group) => group.label === filter.group
        );

        if (existingGroup) {
          existingGroup.filters.push({ ...filter });
        } else {
          groups.push({
            label: filter.group,
            filters: [{ ...filter }],
          });
        }
        return groups;
      }, []);
      // remove null items from array
      groups.filter((n) => n);
      // Sort the groups array and its filters array in ascending order of label.
      groups.sort((a, b) => (a.label > b.label ? 1 : -1));
      groups.forEach((group) =>
        group.filters.sort((a, b) => (a.label > b.label ? 1 : -1))
      );

      // Check the index of the groups array for the 'Category' and 'Collection' groups.
      // If they exist, remove them from the array and unshift them to the start of the array.
      const categoriesIndex = groups.findIndex(
        (group) => group.label === "Category"
      );
      const collectionsIndex = groups.findIndex(
        (group) => group.label === "Collection"
      );

      if (categoriesIndex !== -1) {
        const categories = groups.splice(categoriesIndex, 1);
        groups.unshift(categories[0]);
      }

      if (collectionsIndex !== -1) {
        const collections = groups.splice(collectionsIndex, 1);
        groups.unshift(collections[0]);
      }
      return [...groups];
    });
    return {
      filterGroups,
      removeFilterBySlug,
      selectedFiltersFormat,
    };
  },
});
</script>
