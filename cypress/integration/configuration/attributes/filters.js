/// <reference types="cypress"/>
/// <reference types="../../../support"/>

import {
  getElementByDataTestId,
  SHARED_ELEMENTS
} from "../../../elements/shared/sharedElements";
import { updateAttribute } from "../../../support/api/requests/Attribute";
import { createProduct } from "../../../support/api/requests/Product";
import {
  createTypeAttributeAndCategoryForProduct,
  deleteProductsStartsWith
} from "../../../support/api/utils/products/productsUtils";
import filterTests from "../../../support/filterTests";
import { enterAttributeAndChanegeIsFilterableInDashbord } from "../../../support/pages/attributesPage";
import {
  enterProductListPage,
  selectAttributeFilter,
  showFilters
} from "../../../support/pages/catalog/products/productsListPage";

filterTests({ definedTags: ["all"] }, () => {
  describe("Tests for using attributes in filters", () => {
    const startsWith = "AttrFilter";

    let attribute;

    before(() => {
      cy.clearSessionData().loginUserViaRequest();
      deleteProductsStartsWith(startsWith);
      createTypeAttributeAndCategoryForProduct(startsWith, [startsWith]).then(
        ({ attribute: attributeResp, category, productType }) => {
          attribute = attributeResp;
          createProduct({
            attributeId: attribute.id,
            attributeValue: startsWith,
            categoryId: category.id,
            productTypeId: productType.id,
            name: startsWith
          });
        }
      );
    });

    it("should use attribute as filter", () => {
      updateAttribute({
        attributeId: attribute.id,
        filterableInDashboard: false
      });
      enterAttributeAndChanegeIsFilterableInDashbord(attribute.id);
      enterProductListPage();
      selectAttributeFilter(attribute.slug, attribute.name);
      cy.contains(SHARED_ELEMENTS.tableRow, attribute.name).should(
        "be.visible"
      );
    });

    it("should remove attribute from filters", () => {
      updateAttribute({
        attributeId: attribute.id,
        filterableInDashboard: true
      });
      enterAttributeAndChanegeIsFilterableInDashbord(attribute.id);
      enterProductListPage();
      showFilters();
      cy.get(getElementByDataTestId(attribute.name)).should("not.exist");
    });
  });
});
