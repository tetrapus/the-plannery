import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { Flex } from "components/atoms/Flex";
import { IconButton } from "components/atoms/IconButton";
import { Stack } from "components/atoms/Stack";
import { IngredientCard } from "components/molecules/IngredientCard";
import { Breakpoint } from "components/styles/Breakpoint";
import { AuthStateContext } from "data/auth-state";
import { IngredientAmount, isSameIngredient } from "data/ingredients";
import {
  deletePantryItem,
  Pantry,
  PantryItem,
  updatePantryItem,
} from "data/pantry";
import React, { useContext, useEffect, useState } from "react";
import { MemberSet } from "./MemberSet";

interface Props {
  unpinnedPantryItems: PantryItem[];
  pantry?: Pantry;
  onChange?: (items: MemberSet) => void;
}

export function LeftoverControls({
  unpinnedPantryItems,
  pantry,
  onChange,
}: Props) {
  const { household, insertMeta } = useContext(AuthStateContext);
  const [unselectedLeftovers, setUnselectedLeftovers] = useState<MemberSet>({});
  useEffect(() => {
    if (onChange) {
      onChange(unselectedLeftovers);
    }
  }, [unselectedLeftovers, onChange]);
  return (
    <Stack css={{ marginBottom: 16 }}>
      <h3 css={{ marginLeft: 8 }}>Leftover ingredients</h3>
      <Flex
        css={{
          flexWrap: "wrap",
          marginLeft: 24,
          [Breakpoint.MOBILE]: {
            marginLeft: 8,
            paddingLeft: 0,
          },
        }}
      >
        {unpinnedPantryItems.map((pantryItem) => (
          <IngredientCard
            ingredient={pantryItem.ingredient}
            status={IngredientAmount({
              ingredient: pantryItem.ingredient,
            })}
            onClick={(e) => {
              const id = pantryItem.ingredient.type.id;
              if (unselectedLeftovers[id]) {
                setUnselectedLeftovers((unselectedLeftovers) => {
                  delete unselectedLeftovers[id];
                  return { ...unselectedLeftovers };
                });
              } else {
                setUnselectedLeftovers({
                  ...unselectedLeftovers,
                  [id]: true,
                });
              }
              e.preventDefault();
              e.stopPropagation();
            }}
            done={!!unselectedLeftovers[pantryItem.ingredient.type.id]}
            action={
              <IconButton
                icon={faTrashAlt}
                css={{
                  fontSize: 16,
                  marginLeft: "auto",
                  paddingLeft: 4,
                  ".IngredientCard:not(:hover) &": { visibility: "hidden" },
                }}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (household) {
                    const originalItem = pantry?.items.find((item) =>
                      isSameIngredient(item.ingredient, pantryItem.ingredient)
                    );
                    if (
                      originalItem?.ingredient.qty &&
                      pantryItem.ingredient.qty
                    ) {
                      if (
                        originalItem.ingredient.qty > pantryItem.ingredient.qty
                      ) {
                        await updatePantryItem(
                          household,
                          {
                            ...pantryItem,
                            ingredient: {
                              ...pantryItem.ingredient,
                              qty:
                                originalItem.ingredient.qty -
                                pantryItem.ingredient.qty,
                            },
                          },
                          insertMeta
                        );
                      } else {
                        await deletePantryItem(household, pantryItem);
                      }
                    }
                  }
                }}
              ></IconButton>
            }
          ></IngredientCard>
        ))}
      </Flex>
    </Stack>
  );
}
