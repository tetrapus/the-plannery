import { faSearch, faThumbtack } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useState } from "react";
import Ingredient, {
  denormaliseIngredient,
  displayUnit,
} from "../../data/ingredients";
import { PantryItem } from "../../data/pantry";
import { AuthStateContext } from "../../data/auth-state";
import IngredientCard from "../molecules/IngredientCard";
import firebase from "firebase";

interface Props {
  ingredient: Ingredient;
  pantryItem?: PantryItem | null;
}

export function PantryIngredientCard({ ingredient, pantryItem }: Props) {
  const [busy, setBusy] = useState<boolean>(false);
  const { household, insertMeta } = useContext(AuthStateContext);

  const displayAmount = denormaliseIngredient(ingredient);

  const complete =
    pantryItem &&
    (!pantryItem.ingredient.qty ||
      (ingredient.qty && pantryItem.ingredient.qty >= ingredient.qty));
  const displayPantryAmount =
    !complete && pantryItem
      ? denormaliseIngredient(pantryItem.ingredient, displayAmount?.unit)
      : undefined;

  const togglePantry = async () => {
    if (!household?.ref || pantryItem === null) {
      return;
    }
    const updatePantryBlob = (ingredient: Ingredient) =>
      household.ref
        .collection("blobs")
        .doc("pantry")
        .set(
          {
            [ingredient.type.id]: {
              [JSON.stringify(ingredient.unit)]: {
                ingredient: {
                  qty: ingredient.qty,
                  type: ingredient.type,
                  unit: ingredient.unit,
                },
                ...insertMeta,
              },
            },
          },
          { merge: true }
        );
    const deletePantryBlob = (ingredient: Ingredient) =>
      household.ref
        .collection("blobs")
        .doc("pantry")
        .set(
          {
            [ingredient.type.id]: {
              [JSON.stringify(ingredient.unit)]:
                firebase.firestore.FieldValue.delete(),
            },
          },
          { merge: true }
        );
    if (pantryItem) {
      if (pantryItem.ref) {
        if (complete) {
          if (pantryItem.ingredient.qty) {
            if (ingredient.qty && ingredient.qty < pantryItem.ingredient.qty) {
              await pantryItem.ref.set({
                ingredient: {
                  qty: pantryItem.ingredient.qty - ingredient.qty,
                  type: ingredient.type,
                  unit: ingredient.unit,
                },
                ...insertMeta,
              });
            } else {
              await pantryItem.ref.delete();
            }
          } else {
            await pantryItem.ref.delete();
          }
        } else {
          await pantryItem.ref.set({
            ingredient: {
              qty: ingredient.qty,
              type: ingredient.type,
              unit: ingredient.unit,
            },
            ...insertMeta,
          });
        }
      } else {
        if (complete) {
          if (pantryItem.ingredient.qty) {
            // If the item is already completed, deduct the ingredient amount from the pantry item
            if (ingredient.qty && ingredient.qty < pantryItem.ingredient.qty) {
              await updatePantryBlob({
                ...ingredient,
                qty: pantryItem.ingredient.qty - ingredient.qty,
              });
            } else {
              // That means we delete it if the ingredient qty exceeds what we have in the pantry.
              await deletePantryBlob(pantryItem.ingredient);
            }
          } else {
            // If qty isn't specified, assume we don't have it anymore.
            await deletePantryBlob(pantryItem.ingredient);
          }
        } else {
          // If we haven't finished the pantry item, set the value to the ingredient amount.
          await updatePantryBlob(ingredient);
        }
      }
    } else {
      await updatePantryBlob(ingredient);
    }
  };

  return (
    <IngredientCard
      ingredient={ingredient}
      status={`${displayPantryAmount ? `${displayPantryAmount.qty}/` : ""}${
        displayAmount?.qty || ""
      } ${displayUnit(displayAmount?.unit)}`}
      pinned={!pantryItem?.ingredient.qty || !pantryItem?.ingredient.unit}
      done={!!complete}
      busy={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await togglePantry();
        } catch {}
        setBusy(false);
      }}
      action={
        <>
          {pantryItem &&
          (pantryItem.ingredient.qty || pantryItem.ingredient.unit) ? (
            <FontAwesomeIcon
              icon={faThumbtack}
              css={{
                position: "absolute",
                left: 0,
                top: 0,
                "&:hover": { color: "black" },
                ".IngredientCard:not(:hover) &": { display: "none" },
              }}
              color="grey"
              onClick={async (e) => {
                e.stopPropagation();
                setBusy(true);
                try {
                  if (pantryItem) {
                    if (pantryItem.ref) {
                      await pantryItem.ref.update({
                        "ingredient.qty": null,
                        "ingredient.unit": null,
                      });
                    } else {
                      household?.ref
                        .collection("blobs")
                        .doc("pantry")
                        .set(
                          {
                            [ingredient.type.id]: {
                              [JSON.stringify(ingredient.unit)]:
                                firebase.firestore.FieldValue.delete(),
                              [JSON.stringify(null)]: {
                                ingredient: {
                                  ...ingredient,
                                  qty: null,
                                  unit: null,
                                },
                                ...insertMeta,
                              },
                            },
                          },
                          { merge: true }
                        );
                    }
                  }
                } catch {}
                setBusy(false);
              }}
            />
          ) : (
            <a
              href={`https://www.woolworths.com.au/shop/search/products?searchTerm=${encodeURI(
                ingredient.type.name
              )}&sortBy=TraderRelevance`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <FontAwesomeIcon
                icon={faSearch}
                css={{
                  position: "absolute",
                  right: 2,
                  top: 2,
                  "&:hover": { color: "black" },
                  ".IngredientCard:not(:hover) &": { display: "none" },
                }}
                color="grey"
              />
            </a>
          )}
        </>
      }
    />
  );
}
