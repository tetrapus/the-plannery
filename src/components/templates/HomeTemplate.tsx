import React, { useContext, useEffect, useState } from "react";
import { Stack } from "../atoms/Stack";
import { faCogs, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Flex } from "../atoms/Flex";
import { MealPlan, MealPlanItem } from "../../data/meal-plan";
import {
  getRecipes,
  getSuggestedRecipes,
  RecipesCollection,
} from "../../data/recipes";
import { IngredientList } from "../organisms/IngredientList";
import { Pantry, PantryItem } from "../../data/pantry";
import { Spinner } from "../atoms/Spinner";
import { LikesContext } from "../../data/likes";
import { RecipeList } from "../organisms/RecipeList";
import { Breakpoint } from "../styles/Breakpoint";
import { AuthStateContext } from "../../data/auth-state";
import Select, { OptionsType, OptionTypeBase } from "react-select";
import { ToggleButton } from "../atoms/ToggleButton";
import { MealPlanSection } from "../organisms/MealPlanSection";
import { ShoppingListSection } from "../organisms/ShoppingListSection";
import { InviteSection } from "../organisms/InviteSection";
import { IconButton } from "../atoms/IconButton";

interface State {
  mealPlan: MealPlan;
  pantry: Pantry;
  recipes: any[] | undefined;
  ingredientFilter: string[];
  ingredientBoosts: string[];
  usePantry: boolean;
}

export default function HomeTemplate() {
  const initialState = {
    mealPlan: { recipes: [] },
    pantry: { items: [] },
    recipes: RecipesCollection.initialState,
    ingredientFilter: [],
    ingredientBoosts: [],
    usePantry: true,
  };
  const [
    {
      mealPlan,
      pantry,
      recipes,
      ingredientFilter,
      usePantry,
      ingredientBoosts,
    },
    setState,
  ] = useState<State>(initialState);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const { household, insertMeta } = useContext(AuthStateContext);
  const likes = useContext(LikesContext);
  useEffect(() => {
    const hooks: (() => void)[] = [];
    if (household?.ref) {
      hooks.push(
        household?.ref.collection("mealplan").onSnapshot((snapshot) =>
          setState((state) => ({
            ...state,
            mealPlan: {
              recipes: snapshot.docs.map(
                (doc) => ({ ref: doc.ref, ...doc.data() } as MealPlanItem)
              ),
            },
          }))
        )
      );
      hooks.push(
        household?.ref.collection("pantry").onSnapshot((snapshot) =>
          setState((state) => ({
            ...state,
            pantry: {
              items: snapshot.docs.map(
                (doc) => ({ ref: doc.ref, ...doc.data() } as PantryItem)
              ),
            },
          }))
        )
      );
    }
    RecipesCollection.subscribe((value) =>
      setState((state) => ({ ...state, recipes: value }))
    );
    return () => hooks.forEach((hook) => hook());
  }, [household]);

  return (
    <Flex css={{ margin: "auto" }}>
      {recipes ? (
        <Stack
          css={{
            maxWidth: 800,
            placeItems: "flex-start",
            [Breakpoint.DESKTOP]: {
              marginLeft: "auto",
            },
          }}
        >
          <MealPlanSection mealPlan={mealPlan} />
          <ShoppingListSection mealPlan={mealPlan} pantry={pantry} />
          <div>
            <h1>
              Suggested for you
              <IconButton
                icon={faCogs}
                onClick={() => setShowFilters((state) => !state)}
              />
            </h1>
            {showFilters ? (
              <div css={{ position: "relative" }}>
                <ToggleButton
                  css={{ marginBottom: 8 }}
                  value={usePantry}
                  onChange={(value) =>
                    setState((state) => ({ ...state, usePantry: value }))
                  }
                >
                  Use up pantry items
                </ToggleButton>
                <Select
                  isMulti
                  placeholder="Suggest recipes that use..."
                  css={{ marginBottom: 16, maxWidth: 600 }}
                  options={Object.values(
                    Object.fromEntries(
                      (getRecipes() || [])
                        .map((recipe) => recipe.ingredients)
                        .flat()
                        .map((ingredient) => [ingredient.type.id, ingredient])
                    )
                  ).map((ingredient) => ({
                    value: ingredient.type.id,
                    label: (
                      <Flex css={{ alignItems: "center" }}>
                        <img
                          src={ingredient.type.imageUrl}
                          css={{ height: 16, marginRight: 8 }}
                          alt=""
                        />
                        {ingredient.type.name}
                      </Flex>
                    ),
                  }))}
                  onChange={(options) =>
                    setState((state) => ({
                      ...state,
                      ingredientBoosts: ((options || []) as OptionsType<
                        OptionTypeBase
                      >).map((option) => option.value),
                    }))
                  }
                ></Select>
              </div>
            ) : null}
            <RecipeList
              recipes={
                getSuggestedRecipes(
                  {
                    likes,
                    ingredients: [
                      ...(usePantry
                        ? pantry.items
                            .filter(
                              (item) =>
                                item.ingredient.unit || item.ingredient.qty
                            )
                            .map((item) => item.ingredient.type.id)
                        : []),
                      ...ingredientBoosts,
                    ],
                  },
                  { mealPlan, ingredients: ingredientFilter }
                ) || []
              }
              actions={[
                {
                  icon: faPlus,
                  onClick: (recipe) => () =>
                    household?.ref
                      .collection("mealplan")
                      .add({ slug: recipe.slug, ...insertMeta }),
                },
              ]}
            ></RecipeList>
          </div>
        </Stack>
      ) : (
        <Stack css={{ width: 800, marginLeft: "auto", alignItems: "center" }}>
          <Spinner />
          Downloading recipe database...
        </Stack>
      )}
      <Stack
        css={{
          width: "calc(50vw - 400px)",
          marginLeft: 16,
          [Breakpoint.TABLET]: { display: "none" },
        }}
      >
        <InviteSection />
        <h2>Pantry</h2>
        <IngredientList
          ingredients={pantry.items.map((item) => item.ingredient)}
          pantry={pantry}
        />
      </Stack>
    </Flex>
  );
}
