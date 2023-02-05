import { faSearch, faThumbtack } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useState } from "react";
import Ingredient, {
  denormaliseIngredient,
  displayUnit,
} from "../../data/ingredients";
import {
  deletePantryItem,
  PantryItem,
  updatePantryItem,
} from "../../data/pantry";
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

    if (pantryItem) {
      if (complete) {
        if (pantryItem.ingredient.qty) {
          // If the item is already completed, deduct the ingredient amount from the pantry item
          if (ingredient.qty && ingredient.qty < pantryItem.ingredient.qty) {
            await updatePantryItem(
              household,
              {
                ...pantryItem,
                ingredient: {
                  ...ingredient,
                  qty: pantryItem.ingredient.qty - ingredient.qty,
                },
              },
              insertMeta
            );
          } else {
            // That means we delete it if the ingredient qty exceeds what we have in the pantry.
            await deletePantryItem(household, pantryItem);
          }
        } else {
          // If qty isn't specified, assume we don't have it anymore.
          await deletePantryItem(household, pantryItem);
        }
      } else {
        // If we haven't finished the pantry item, set the value to the ingredient amount.
        await updatePantryItem(
          household,
          { ...pantryItem, ingredient },
          insertMeta
        );
      }
    } else {
      await updatePantryItem(household, { ingredient }, insertMeta);
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
