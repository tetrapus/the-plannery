// ==UserScript==
// @name         Woolies Plannery Integration
// @namespace    http://joey.town/
// @version      0.1
// @description  Shop for items from the Plannery on Woolies
// @author       mayor@joey.town
// @match        https://the-plannery.web.app/
// @icon         https://the-plannery.web.app/favicon.ico
// @grant        GM_xmlhttpRequest
// @connect      woolworths.com.au
// ==/UserScript==

(function () {
  function wooliesApi(method, resource, body) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        url: `https://www.woolworths.com.au/apis/ui/${resource}`,
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "cache-control": "no-cache",
          "content-type": "application/json",
        },
        data: body ? JSON.stringify(body) : "",
        method: method,
        onload: (response) => {
          console.log(response);
          resolve(JSON.parse(response.responseText || "null"));
        },
        onerror: (response) => reject(response),
        onabort: (response) => reject(response),
        ontimeout: (response) => reject(response),
      });
    });
  }

  function search(query) {
    return wooliesApi("POST", "Search/products", {
      Filters: [],
      IsSpecial: false,
      Location: "/shop/search/products",
      PageNumber: 1,
      PageSize: 24,
      SearchTerm: query,
      SortType: "TraderRelevance",
    });
  }

  function getCart() {
    return wooliesApi("GET", "Trolley", null);
  }

  function addToCart(stockcode, quantity) {
    return wooliesApi("POST", "Trolley/Items", {
      stockcode: stockcode,
      quantity,
      source: "ProductDetail",
      diagnostics: "0",
    });
  }

  function removeFromCart(stockcode) {
    return wooliesApi("POST", "Trolley/Remove", {
      Stockcode: stockcode,
      evaluateRewardPoints: true,
    });
  }

  function updateCart(stockcode, quantity) {
    return wooliesApi("POST", "Trolley/UpdateItem", {
      stockcode,
      quantity,
      evaluateRewardPoints: true,
    });
  }

  function init() {
    document.woolies = {
      search,
      addToCart,
      getCart,
      removeFromCart,
      updateCart,
    };
  }

  init();
})();
