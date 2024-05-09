<template>
  <q-dialog
    :model-value="isOpen"
    @update:model-value="(value) => $emit('update:isOpen', value)"
    @show="searchInput.focus()"
  >
    <div class="search-wrapper">
      <q-card
        style="width: 350px; height: 120px"
        class="q-pt-lg expand-transition"
      >
        <q-card-section class="q-pt-none">
          <q-form @submit="onSubmit">
            <q-input
              ref="searchInput"
              v-model="searchTerm"
              rounded
              outlined
              bottom-slots
              debounce="500"
              :placeholder="placeholder"
              @update:model-value="onUpdate"
            >
              <template #prepend>
                <q-spinner v-if="isFetching" color="secondary" />
                <q-icon
                  v-else
                  :name="searchSuggestions.length > 0 ? 'sort' : ''"
                />
              </template>
              <template #append>
                <q-btn flat round @click="onSubmit">
                  <q-icon name="search" />
                </q-btn>
              </template>
            </q-input>
          </q-form>
        </q-card-section>
      </q-card>
      <transition
        appear
        enter-active-class="animated fadeInDown"
        leave-active-class="fadeOutUp"
      >
        <q-card
          v-if="searchSuggestions.length > 0"
          class="search-suggestions"
          style="width: 350px; margin-top: 2px"
        >
          <q-list dense>
            <transition-group
              appear
              enter-active-class="animated flipInX"
              leave-active-class="animated flipOutX"
            >
              <q-item
                v-for="suggestion in searchSuggestions"
                :key="suggestion.value"
                v-ripple
                v-dompurify-html="suggestion.html"
                clickable
                class="search-suggestion"
                @click="
                  searchTerm = suggestion.label;
                  searchSuggestions = [];
                  onSubmit(suggestion);
                "
              />
            </transition-group>
          </q-list>
        </q-card>
      </transition>
    </div>
  </q-dialog>
</template>

<script>
// TODO: clean up the transition effect of search suggestions...
import { defineComponent, ref } from "vue";
import algoliasearch from "algoliasearch/lite";
import { useRouter } from "vue-router";
import { db } from "boot/firebase";
import { doc, getDoc } from "@firebase/firestore";

export default defineComponent({
  name: "DialogSearch",
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    onlySkus: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: "Product, Attribute or Theme",
    },
    searchDefault: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:isOpen", "search"],
  setup(props, { emit }) {
    const router = useRouter();
    const searchInput = ref(null);
    const isFetching = ref(false);
    const searchTerm = ref(null);
    const searchSuggestions = ref([]);
    const searchClient = algoliasearch(
      process.env.ALGOLIA_APP,
      process.env.ALGOLIA_PUBLIC
    );

    const getResults = async (term) => {
      return new Promise(async (resolve, reject) => {
        const combined = [];
        const queries = [
          {
            indexName: "products",
            query: term.toLowerCase(),
            params: {
              attributesToRetrieve: ["sku", "name"],
              hitsPerPage: 5,
              exactOnSingleWordQuery: "word",
              disableTypoToleranceOnAttributes: ["name", "sku"],
            },
          },
        ];
        if (!props.onlySkus) {
          queries.push({
            indexName: "product_attributes",
            query: term.toLowerCase(),
            params: {
              attributesToRetrieve: ["attribute"],
              hitsPerPage: 5,
            },
          });
          queries.push({
            indexName: "product_themes",
            query: term.toLowerCase(),
            params: {
              attributesToRetrieve: ["theme"],
              hitsPerPage: 5,
            },
          });
        }
        await searchClient.multipleQueries(queries).then(({ results }) => {
          // combine all hits into 1 array of objects with
          // {html, value, index}
          for (const result of results) {
            const hits = result.hits;
            if (hits.length > 0) {
              for (const hit of hits) {
                if (
                  hit.name &&
                  hit._highlightResult.name.matchLevel !== "none"
                ) {
                  // is product
                  // check to see if sku and name are different first
                  combined.push({
                    html: hit._highlightResult.name.value,
                    value: hit.sku,
                    label: hit.name,
                    search: "product",
                  });
                } else if (
                  hit.theme &&
                  hit._highlightResult.theme.matchLevel !== "none"
                ) {
                  // is theme
                  combined.push({
                    html: hit._highlightResult.theme.value,
                    value: hit.theme.toLowerCase(),
                    label: hit.theme,
                    search: "theme",
                  });
                } else if (
                  hit.attribute &&
                  hit._highlightResult.attribute.matchLevel !== "none"
                ) {
                  // is attribute
                  combined.push({
                    html: hit._highlightResult.attribute.value,
                    value: hit.attribute.toLowerCase(),
                    label: hit.attribute,
                    search: "attribute",
                  });
                }
              }
            }
          }
        });
        resolve(combined);
      });
    };

    const onUpdate = async (val) => {
      isFetching.value = true;
      searchSuggestions.value = await getResults(val);
      isFetching.value = false;
    };

    const onSubmit = async (suggestion) => {
      // if user selected a suggestion, it will have the correct sku as .value, otherwise just use the input text
      const search = suggestion.value ? suggestion.value : searchTerm.value;
      if (!props.searchDefault) {
        emit("search", search);
      } else {
        const docSnap = await getDoc(doc(db, `products/${searchTerm.value}`));
        if (docSnap.exists()) {
          router.push(`/product/${searchTerm.value}`);
        } else {
          router.push(`/products/search/${searchTerm.value}`);
        }
      }
      emit("update:isOpen", false);
    };

    return {
      searchInput,
      searchTerm,
      searchSuggestions,
      isFetching,
      onUpdate,
      onSubmit,
    };
  },
});
</script>
<style></style>
