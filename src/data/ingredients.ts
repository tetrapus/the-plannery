import { Recipe } from "./recipes";

export interface IngredientType {
  id: string;
  name: string;
  imageUrl: string;
}

export default interface Ingredient {
  type: IngredientType;
  qty?: number;
  unit?: string;
  usedIn?: Recipe[];
}

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
  butter: {
    ml: { unit: "g", qty: 1 },
  },
  "baby spinach leaves": {
    bag: { unit: "g", qty: 60 },
  },
  "spinach & rocket mix": {
    bag: { unit: "g", qty: 60 },
  },
  bacon: {
    packet: { unit: "g", qty: 200 },
  },
  "pork mince": { packet: { unit: "g", qty: 500 } },
  "chicken breast": { packet: { unit: "g", qty: 500 } },
  "sugar snap peas": { bag: { unit: "g", qty: 150 } },
  potatoes: { unit: { unit: "g", qty: 150 } },
  "panko breadcrumbs": {
    packet: { unit: "g", qty: 100 },
    ml: { unit: "g", qty: 0.4 },
  },
};

export function normaliseIngredient(ingredient: Ingredient) {
  let normaliser;

  if (!ingredient.qty || !ingredient.unit) {
    return;
  }

  do {
    normaliser = {
      ...globalNormalisers,
      ...(ingredientNormalisers[ingredient.type.name] || {}),
    }[ingredient.unit as string];
    if (normaliser) {
      ingredient = {
        ...ingredient,
        qty: (ingredient.qty as number) * normaliser.qty,
        unit: normaliser.unit,
      };
    }
  } while (normaliser);
  return ingredient;
}

interface DisplayAmount {
  unit: string;
  qty: string;
}

export function denormaliseIngredient(
  ingredient: Ingredient,
  toUnit?: string
): DisplayAmount | undefined {
  if (!ingredient.qty || !ingredient.unit) {
    return;
  }
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
    if (isDivisible(ingredient.qty, normaliser.qty) || toUnit === unit) {
      displayQty = (ingredient.qty / normaliser.qty).toLocaleString(undefined, {
        maximumFractionDigits: 1,
      });
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
  a.type.id === b.type.id && (a.unit === b.unit || !a.unit || !b.unit);
