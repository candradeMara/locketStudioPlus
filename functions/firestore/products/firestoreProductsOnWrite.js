import * as algoliasearch from "algoliasearch";

/**
 * Send all product changes to algolia service
 * @param {*} change
 * @returns Promise
 */

export default async (change, context) => {
  return new Promise(async (resolve, reject) => {
    try {
      const algolia = algoliasearch(
        process.env.ALGOLIA_APP,
        process.env.ALGOLIA_ADMIN
      );
      const index = algolia.initIndex("products");
      if (!change.after.exists) {
        // doc got deleted, remove the index
        resolve(await index.deleteObject(change.before.id));
      } else if (!change.before.exists) {
        // new doc, create a new index
        const payload = change.after.data();
        const algoliaFilters = [];
        // Transform Filters
        if (payload.filters) {
          const filterLabels = {};
          for (const filterKey in payload.filters) {
            algoliaFilters.push(filterKey);
          }
        }

        // transform attributes
        const algoliaAttributes = [];
        if (payload.attributes) {
          for (const attributeGroup of payload.attributes) {
            if (
              attributeGroup.label !== "Bracelet Circumference" &&
              attributeGroup.label !== "Width" &&
              attributeGroup.label !== "Height"
            ) {
              if (attributeGroup.values) {
                for (const attribute of attributeGroup.values) {
                  algoliaAttributes.push(attribute);
                }
              }
            }
          }
        }

        // transform themes
        let algoliaThemes = [];
        if (payload.themes) {
          algoliaThemes = [...payload.themes];
        }

        const newData = {
          objectID: change.after.id,
          sku: payload.sku,
          name: payload.name,
          filters: algoliaFilters,
          attributes: algoliaAttributes,
          themes: algoliaThemes,
          materials: payload.materials,
          short_description: payload.short_description,
          long_description: payload.long_description,
          visibility: payload.visibility,
          price: payload.price,
          parent: payload.children ? true : false,
          child: payload.parent ? true : false,
        };
        resolve(await index.saveObject({ ...newData }));
      } else {
        // doc changed, see if we need to update
        const payload = change.after.data();
        const algoliaFilters = [];
        // Transform Filters
        if (payload.filters) {
          for (const filterKey in payload.filters) {
            algoliaFilters.push(filterKey);
          }
        }
        // transform attributes
        const algoliaAttributes = [];
        if (payload.attributes) {
          for (const attributeGroup of payload.attributes) {
            if (
              attributeGroup.label !== "Bracelet Circumference" &&
              attributeGroup.label !== "Width" &&
              attributeGroup.label !== "Height"
            ) {
              if (attributeGroup.values) {
                for (const attribute of attributeGroup.values) {
                  algoliaAttributes.push(attribute);
                }
              }
            }
          }
        }

        // transform themes
        let algoliaThemes = [];
        if (payload.themes) {
          algoliaThemes = [...payload.themes];
        }

        const newData = {
          objectID: change.after.id,
          sku: payload.sku,
          name: payload.name,
          filters: algoliaFilters,
          attributes: algoliaAttributes,
          themes: algoliaThemes,
          materials: payload.materials,
          short_description: payload.short_description,
          long_description: payload.long_description,
          visibility: payload.visibility,
          price: payload.price,
          parent: payload.children ? true : false,
          child: payload.parent ? true : false,
        };
        resolve(await index.saveObject({ ...newData }));
      }
    } catch (error) {
      reject(error);
    }
  });
};
