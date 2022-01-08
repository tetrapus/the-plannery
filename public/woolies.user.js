// ==UserScript==
// @name         Woolies Plannery Integration
// @namespace    http://joey.town/
// @version      0.2
// @description  Shop for items from the Plannery on Woolies
// @author       mayor@joey.town
// @match        https://the-plannery.web.app/*
// @icon         https://the-plannery.web.app/favicon.ico
// @updateURL    https://the-plannery.web.app/woolies.user.js
// @grant        GM_xmlhttpRequest
// @connect      woolworths.com.au
// ==/UserScript==

(function () {
  function wooliesApi(method, resource, body) {
    const genRanHex = (size) =>
      [...Array(size)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("");

    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        url: `https://www.woolworths.com.au/apis/ui/${resource}`,
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "cache-control": "no-cache",
          "content-type": "application/json",
          "request-context":
            "appId=cid-v1:099a45be-5030-453c-b870-6f6cb4dacdb8",
          "request-id": `|${genRanHex(32)}.${genRanHex(16)}`,
        },
        data: body ? JSON.stringify(body) : "",
        method: method,
        onload: (response) => {
          console.log(response);
          try {
            resolve(JSON.parse(response.responseText || "null"));
          } catch {
            reject(response);
          }
        },
        onerror: (response) => reject(response),
        onabort: (response) => reject(response),
        ontimeout: (response) => reject(response),
      });
    });
  }

  function mobileApi(method, resource, body) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        url: `https://prod.mobile-api.woolworths.com.au/wow/v1/${resource}`,
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "cache-control": "no-cache",
          "content-type": "application/json",
          "x-api-key": "s7iXf5Rixn4XxFrsYh4HKkriVp8hlnec",
        },
        data: body ? JSON.stringify(body) : "",
        method: method,
        onload: (response) => {
          console.log(response);
          try {
            resolve(JSON.parse(response.responseText || "null"));
          } catch {
            reject(response);
          }
        },
        onerror: (response) => reject(response),
        onabort: (response) => reject(response),
        ontimeout: (response) => reject(response),
      });
    });
  }

  function getOrders(shopperId) {
    return mobileApi(
      "GET",
      `orders/api/orders?shopperId=${shopperId}&pageNumber=1&pageSize=20`
    );
  }

  function getOrder(orderId) {
    return mobileApi("GET", `orders/api/orders/${orderId}`);
  }

  function bootstrap(method, resource, body) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        url: "https://www.woolworths.com.au/api/ui/v2/bootstrap",
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "cache-control": "no-cache",
          pragma: "no-cache",
          "content-type": "application/json",
        },
        data: null,
        method: "GET",
        onload: (response) => {
          console.log(response);
          try {
            resolve(JSON.parse(response.responseText || "null"));
          } catch {
            reject(response);
          }
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
      bootstrap,
      getOrders,
      getOrder,
    };
  }

  init();
})();
