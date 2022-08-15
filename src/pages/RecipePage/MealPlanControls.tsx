import React, { useContext, useState } from "react";
import { Recipe } from "../../data/recipes";
import { AuthStateContext } from "../../data/auth-state";
import { faCheck, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Flex } from "../../components/atoms/Flex";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MealPlanContext } from "data/meal-plan";
import { markRecipeComplete } from "data/markRecipeComplete";
import { PantryContext } from "data/pantry";

export function MealPlanControls({
  recipe,
  ...props
}: { recipe: Recipe } & React.ComponentProps<"div">) {
  const { household, insertMeta } = useContext(AuthStateContext);
  const mealPlan = useContext(MealPlanContext);
  const pantry = useContext(PantryContext);
  const [busy, setBusy] = useState<boolean>(false);
  const planItem = mealPlan?.recipes.find(
    (planItem) => planItem.slug === recipe.slug
  );
  return (
    <Flex {...props}>
      {planItem ? (
        <>
          <FontAwesomeIcon
            icon={faTimes}
            css={{
              color: "#ccc",
              cursor: "pointer",
              opacity: busy ? 0.5 : 1,
              marginRight: 16,
            }}
            onClick={async (e) => {
              e.stopPropagation();
              e.preventDefault();
              setBusy(true);
              try {
                await planItem.ref.delete();
              } catch {}
              setBusy(false);
            }}
          />
          <FontAwesomeIcon
            icon={faCheck}
            css={{
              color: "#ccc",
              cursor: "pointer",
              opacity: busy ? 0.5 : 1,
            }}
            onClick={async (e) => {
              e.stopPropagation();
              e.preventDefault();
              setBusy(true);
              try {
                await markRecipeComplete({
                  recipe,
                  household,
                  pantry,
                  mealPlan,
                  insertMeta,
                });
              } catch {}
              setBusy(false);
            }}
          />
        </>
      ) : (
        <FontAwesomeIcon
          icon={faPlus}
          css={{
            color: "#ccc",
            cursor: "pointer",
            opacity: busy ? 0.5 : 1,
          }}
          onClick={async (e) => {
            e.stopPropagation();
            e.preventDefault();
            setBusy(true);
            try {
              await household?.ref.collection("mealplan").add({
                slug: recipe.slug,
                ...insertMeta,
                planId: household?.planId || null,
              });
            } catch {}
            setBusy(false);
          }}
        />
      )}
    </Flex>
  );
}
