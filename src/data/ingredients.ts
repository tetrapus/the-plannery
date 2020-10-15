import Ingredient from "../models/Ingredient";

interface Amount {
  unit: string;
  qty: number;
}

const globalNormalisers: { [unit: string]: Amount } = {
  tsp: { unit: "ml", qty: 5 },
  tbsp: { unit: "ml", qty: 15 },
  tbs: { unit: "ml", qty: 15 },
  cup: { unit: "ml", qty: 250 },
  litre: { unit: "ml", qty: 1000 },
};

const ingredientNormalisers: { [name: string]: { [unit: string]: Amount } } = {
  "jasmine rice": {
    packet: { unit: "ml", qty: 167 },
  },
  "olive oil": {
    unit: { unit: "ml", qty: 50 },
  },
  "Asian greens": {
    unit: { unit: "bunch", qty: 1 },
  },
};

export function normaliseIngredient(ingredient: Ingredient) {
  const normaliser = {
    ...globalNormalisers,
    ...(ingredientNormalisers[ingredient.type.name] || {}),
  }[ingredient.unit];
  if (normaliser) {
    return {
      ...ingredient,
      qty: ingredient.qty * normaliser.qty,
      unit: normaliser.unit,
    };
  }
  return ingredient;
}

interface DisplayAmount {
  unit: string;
  qty: string;
}

export function denormaliseIngredient(ingredient: Ingredient): DisplayAmount {
  const tiers = Object.entries(globalNormalisers)
    .filter(([unit, normaliser]) => ingredient.unit === normaliser.unit)
    .sort((a, b) => b[1].qty - a[1].qty);

  const isDivisible = (number: number, divisor: number) =>
    Math.abs(Math.round(number / divisor) - number / divisor) < 0.00001;

  const getWholePart = (number: number, divisor: number) => {
    const result = Math.floor(number / divisor);
    return result ? result.toLocaleString() : "";
  };

  for (let i = 0; i < tiers.length; i++) {
    const [unit, normaliser] = tiers[i];
    let displayQty;
    if (isDivisible(ingredient.qty, normaliser.qty)) {
      displayQty = (ingredient.qty / normaliser.qty).toLocaleString();
    } else if (isDivisible(ingredient.qty * 4, normaliser.qty)) {
      displayQty =
        getWholePart(ingredient.qty, normaliser.qty) +
        ["", "¼", "½", "¾"][
          Math.round(
            (ingredient.qty / normaliser.qty -
              Math.floor(ingredient.qty / normaliser.qty)) *
              4
          )
        ];
    } else if (isDivisible(ingredient.qty * 3, normaliser.qty)) {
      displayQty =
        getWholePart(ingredient.qty, normaliser.qty) +
        ["", "⅓", "⅔"][
          Math.round(
            (ingredient.qty / normaliser.qty -
              Math.floor(ingredient.qty / normaliser.qty)) *
              3
          )
        ];
    }
    if (displayQty) {
      return {
        unit,
        qty: displayQty,
      };
    }
  }
  return { unit: ingredient.unit, qty: ingredient.qty.toLocaleString() };
}

export const isSameIngredient = (a: Ingredient, b: Ingredient) =>
  a.type.id === b.type.id && a.unit === b.unit;
