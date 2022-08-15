import { Household } from "./auth-state";
import { MealPlan } from "./meal-plan";
import { Pantry } from "./pantry";
import { Recipe } from "./recipes";
import { isSameIngredient } from "./ingredients";
import { db } from "../init/firebase";
import firebase from "firebase";
import { assertNever } from "../pages/HomePage/MealPlanSection";

export async function markRecipeComplete({
  recipe,
  pantry,
  household,
  insertMeta,
  mealPlan,
}: {
  recipe: Recipe;
  pantry?: Pantry;
  household?: Household | null;
  insertMeta: any;
  mealPlan?: MealPlan;
}) {
  await household?.ref
    .collection("history")
    .add({ ...insertMeta, slug: recipe.slug });
  if (pantry) {
    const pantryItems = recipe.ingredients.map((ingredient) => {
      const pantryItem = pantry.items.find((item) =>
        isSameIngredient(item.ingredient, ingredient)
      );
      return { ingredient, pantryItem };
    });
    const pantryCollectionItems = pantryItems.filter(
      ({ pantryItem }) => pantryItem && pantryItem.ref
    );
    const pantryBlobItems = pantryItems.filter(
      ({ pantryItem }) => !pantryItem || !pantryItem.ref
    );

    const batch = db.batch();
    if (pantryCollectionItems.length) {
      pantryCollectionItems.forEach(({ ingredient, pantryItem }) => {
        if (!pantryItem?.ref) {
          assertNever();
        }
        if (pantryItem && pantryItem.ingredient.qty && ingredient.qty) {
          if (pantryItem.ingredient.qty > ingredient.qty) {
            batch.set(pantryItem.ref, {
              ingredient: {
                ...pantryItem.ingredient,
                qty: pantryItem.ingredient.qty - ingredient.qty,
              },
              ...insertMeta,
            });
          } else {
            batch.delete(pantryItem.ref);
          }
        }
      });
    }

    if (pantryBlobItems.length && household) {
      const blobDelta = {} as { [key: string]: { [key: string]: any } };
      pantryBlobItems.forEach(({ ingredient, pantryItem }) => {
        if (pantryItem && pantryItem.ingredient.qty && ingredient.qty) {
          if (!blobDelta[ingredient.type.id]) {
            blobDelta[ingredient.type.id] = {};
          }
          if (pantryItem.ingredient.qty > ingredient.qty) {
            blobDelta[ingredient.type.id][JSON.stringify(ingredient.unit)] = {
              ingredient: {
                ...pantryItem.ingredient,
                qty: pantryItem.ingredient.qty - ingredient.qty,
              },
              ...insertMeta,
            };
          } else {
            blobDelta[ingredient.type.id][JSON.stringify(ingredient.unit)] =
              firebase.firestore.FieldValue.delete();
          }
        }
      });
      batch.set(household.ref.collection("blobs").doc("pantry"), blobDelta, {
        merge: true,
      });
    }

    await batch.commit();
  }
  await mealPlan?.recipes
    .find((mealPlanItem) => mealPlanItem.slug === recipe.slug)
    ?.ref.delete();
}
