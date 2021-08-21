import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import React, { useContext } from "react";
import { Flex } from "../../components/atoms/Flex";
import { IconButton } from "../../components/atoms/IconButton";
import IngredientCard from "../../components/molecules/IngredientCard";
import { AuthStateContext } from "../../data/auth-state";
import Ingredient, {
  denormaliseIngredient,
  displayUnit,
} from "../../data/ingredients";
import { Recipe } from "../../data/recipes";
import { Session } from "../../data/session";
import { useFirestore } from "../../init/firebase";
import { useStateObject } from "../../util/use-state-object";
import { Darkmode } from "../../components/styles/Darkmode";

interface Props {
  recipe: Recipe;
  session: Session;
  sortKey: (ingredient: Ingredient) => number;
}

export default function IngredientChecklist({
  recipe,
  session,
  sortKey,
}: Props) {
  const ingredientsExpanded$ = useStateObject<boolean>(false);
  const busy$ = useStateObject<string[]>([]);

  const { insertMeta } = useContext(AuthStateContext);

  const usedIngredients = useFirestore(
    session.ref,
    (session) => session.collection("usedIngredients"),
    (snapshot) => snapshot.docs.map((doc) => doc.id)
  );

  const isUsed = (ingredient: Ingredient) =>
    usedIngredients?.includes(ingredient.type.name);

  return (
    <>
      <Flex
        css={{
          position: "fixed",
          top: 0,
          left: 0,
          background: "#eeeeee",
          zIndex: 100,
          borderBottom: "1px solid #dedede",
          overflow: "scroll",
          width: "100vw",
          flexWrap: ingredientsExpanded$.value ? "wrap" : "inherit",
          [Darkmode]: {
            background: "#222",
            borderBottom: "1px solid black",
          },
        }}
      >
        <IconButton
          icon={ingredientsExpanded$.value ? faChevronUp : faChevronDown}
          onClick={() => ingredientsExpanded$.set((value) => !value)}
          css={{ margin: "auto 16px" }}
        />
        {recipe.ingredients
          .sort((a, b) =>
            isUsed(a) === isUsed(b)
              ? sortKey(a) - sortKey(b)
              : isUsed(a)
              ? 1
              : -1
          )
          .map((ingredient) => {
            const displayAmount = denormaliseIngredient(ingredient);

            return (
              <IngredientCard
                key={ingredient.type.name}
                ingredient={ingredient}
                status={`${displayAmount?.qty || ""} ${displayUnit(
                  displayAmount?.unit
                )}`}
                done={
                  !!usedIngredients &&
                  usedIngredients.includes(ingredient.type.name)
                }
                busy={busy$.value.includes(ingredient.type.name)}
                onClick={async (e) => {
                  busy$.set((value) => [...value, ingredient.type.name]);
                  if (
                    usedIngredients &&
                    usedIngredients.includes(ingredient.type.name)
                  ) {
                    await session.ref
                      .collection("usedIngredients")
                      .doc(ingredient.type.name)
                      .delete();
                  } else {
                    await session.ref
                      .collection("usedIngredients")
                      .doc(ingredient.type.name)
                      .set(insertMeta);
                  }
                  busy$.set((value) =>
                    value.filter((name) => name !== ingredient.type.name)
                  );
                }}
              />
            );
          })}
      </Flex>
    </>
  );
}
