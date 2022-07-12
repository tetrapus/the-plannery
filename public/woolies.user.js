// ==UserScript==
// @name         Woolies Plannery Integration
// @namespace    http://joey.town/
// @version      0.4
// @description  Shop for items from the Plannery on Woolies
// @author       mayor@joey.town
// @match        *://*/*
// @icon         https://the-plannery.web.app/favicon.ico
// @updateURL    https://the-plannery.web.app/woolies.user.js
// @grant        GM_xmlhttpRequest
// @connect      woolworths.com.au
// ==/UserScript==

/*jshint esversion: 6 */
/*global GM_xmlhttpRequest*/

(function () {
  if (window.location.host === "the-plannery.web.app") {
    function genRanHex(size) {
      return [...Array(size)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("");
    }

    function request(params) {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          ...params,
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

    function wooliesApi(method, resource, body) {
      return request({
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
      });
    }

    function mobileApi(method, resource, body) {
      return request({
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

    function login(email, password) {
      return request({
        url: "https://www.woolworths.com.au/apis/ui/login/loginwithcredential",
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "cache-control": "no-cache",
          "content-type": "application/json",
          pragma: "no-cache",
          "request-context":
            "appId=cid-v1:099a45be-5030-453c-b870-6f6cb4dacdb8",
          "request-id": `|${genRanHex(32)}.${genRanHex(16)}`,
        },
        data: JSON.stringify({
          Email: email,
          Password: password,
          RememberMe: false,
          LinkToken: null,
          UserIdFromAgent: null,
        }),
        method: "POST",
      });
    }

    function bootstrap() {
      return request({
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
      });
    }

    function otp(code) {
      return request({
        url: "https://www.woolworths.com.au/api/v3/ui/authentication/otp",
        headers: {
          accept: "application/json, text/plain, * /*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "cache-control": "no-cache",
          "content-type": "application/json",
          pragma: "no-cache",
          "request-context":
            "appId=cid-v1:099a45be-5030-453c-b870-6f6cb4dacdb8",
          "request-id": `|${genRanHex(32)}.${genRanHex(16)}`,
        },
        data: JSON.stringify({ OneTimePin: code, UpdatePrimaryContact: null }),
        method: "POST",
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
        login,
        otp,
      };
    }
    init();
    console.log("[Plannery] Woolies Enabled");
  } else {
    console.log("[Plannery] Scanning for Recipe OG");

    function* walkJsonLd(doc) {
      if (doc["@type"] === "Recipe") {
        yield doc;
      } else {
        const values = Object.values(doc);
        for (const value of values) {
          if (typeof value === "object") {
            yield* walkJsonLd(value);
          }
        }
      }
    }

    function makeSlug(str) {
      return str.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }

    function ifType(value, transform) {
      return transform[typeof value](value);
    }

    const OG_candidates = Array.from(
      document.querySelectorAll("script[type='application/ld+json']")
    );
    const recipes = OG_candidates.flatMap((candidate) =>
      Array.from(walkJsonLd(JSON.parse(candidate.innerText)))
    );
    console.log(
      recipes.map(
        (recipe) =>
          `https://the-plannery.web.app/recipes/new#${encodeURIComponent(
            JSON.stringify(recipe)
          )}`
      )
    );
    if (recipes.length) {
      const floater = document.createElement("div");
      const logo = document.createElement("img");
      logo.src = "https://the-plannery.web.app/logo.png";
      floater.appendChild(logo);
      floater.style = `
        height: 32px;
        width: 32px;
        position: fixed;
        bottom: 32px;
        right: 32px;
        z-index: 99999999;
      `;
      logo.style = `width: 100%; height: 100%`;
      floater.addEventListener("click", (e) => {
        const blackout = document.createElement("div");
        blackout.style = `
          position: fixed;
          background: black;
          opacity: 0.3;
          width: 100vw;
          height: 100vh;
          top: 0;
          left: 0;
          z-index: 100000000;
        `;
        const frame = document.createElement("iframe");
        frame.src = `https://the-plannery.web.app/recipes/new#${encodeURIComponent(
          JSON.stringify(recipes[0])
        )}`;
        frame.style = `
          position: fixed;
          width: 30vw;
          height: 90vh;
          bottom: 5vh;
          right: 5vw;
          z-index: 100000001;
          border: 1px solid #c0c0c0;
          border-radius: 3px;
        `;
        blackout.addEventListener("click", (e) => {
          document.body.removeChild(frame);
          document.body.removeChild(blackout);
        });
        document.body.appendChild(blackout);
        document.body.appendChild(frame);
      });
      document.body.appendChild(floater);
    }
  }
})();
