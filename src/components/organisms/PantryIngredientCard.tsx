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
      await household.ref.collection("pantry").add({
        ingredient: {
          qty: ingredient.qty,
          type: ingredient.type,
          unit: ingredient.unit,
        },
        ...insertMeta,
      });
    }
  };

  return (
    <IngredientCard
      ingredient={ingredient}
      status={`${displayPantryAmount ? `${displayPantryAmount.qty}/` : ""}${
        displayAmount?.qty || ""
      } ${displayUnit(displayAmount?.unit)}`}
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
          {pantryItem && (ingredient.qty || ingredient.unit) ? (
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
                  await pantryItem?.ref.update({
                    "ingredient.qty": null,
                    "ingredient.unit": null,
                  });
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
