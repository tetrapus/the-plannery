import React, { useContext, useEffect, useState } from "react";
import { Stack } from "../atoms/Stack";
import { faCogs, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Flex } from "../atoms/Flex";
import { MealPlan, MealPlanItem } from "../../data/meal-plan";
import {
  getRecipes,
  getSuggestedRecipes,
  Recipe,
  RecipesCollection,
} from "../../data/recipes";
import { IngredientList } from "../organisms/IngredientList";
import { PantryContext } from "../../data/pantry";
import { Spinner } from "../atoms/Spinner";
import { LikesContext } from "../../data/likes";
import { RecipeList } from "../organisms/RecipeList";
import { Breakpoint } from "../styles/Breakpoint";
import { AuthStateContext } from "../../data/auth-state";
import Select, { OptionsType, OptionTypeBase } from "react-select";
import { ToggleButton } from "../atoms/ToggleButton";
import { MealPlanSection } from "../organisms/MealPlanSection";
import { ShoppingListSection } from "../organisms/ShoppingListSection";
import { YourHomeSection } from "../organisms/YourHomeSection";
import { IconButton } from "../atoms/IconButton";
import { useSubscription } from "../../util/use-subscription";
import { useStateObject } from "../../util/use-state-object";
import { TrashContext } from "../../data/trash";
import { NowCookingSection } from "../organisms/NowCookingSection";

interface State {
  mealPlan: MealPlan;
  ingredientFilter: string[];
  ingredientBoosts: string[];
  usePantry: boolean;
}

export default function HomeTemplate() {
  const initialState = {
    mealPlan: { recipes: [] },
    ingredientFilter: [],
    ingredientBoosts: [],
    usePantry: false,
  };
  const [
    { mealPlan, ingredientFilter, usePantry, ingredientBoosts },
    setState,
  ] = useState<State>(initialState);
  const includeTrash$ = useStateObject<boolean>(false);
  const showFilters$ = useStateObject<boolean>(false);
  const { household, insertMeta } = useContext(AuthStateContext);
  const likes = useContext(LikesContext);
  const trash = useContext(TrashContext);
  const pantry = useContext(PantryContext);
  const [tagFilter, setTagFilter] = useState<string[]>([]);

  useEffect(() => {
    if (household?.ref) {
      return household?.ref.collection("mealplan").onSnapshot((snapshot) =>
        setState((state) => ({
          ...state,
          mealPlan: {
            recipes: snapshot.docs.map(
              (doc) => ({ ref: doc.ref, ...doc.data() } as MealPlanItem)
            ),
          },
        }))
      );
    }
  }, [household]);

  const recipes = useSubscription<Recipe[]>((setState) =>
    RecipesCollection.subscribe((value) => setState(getRecipes(value)))
  );

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
          <NowCookingSection recipes={recipes} />
          <MealPlanSection mealPlan={mealPlan} recipes={recipes} />
          <ShoppingListSection mealPlan={mealPlan} recipes={recipes} />
          <div>
            <h1>
              Suggested for you
              <IconButton
                icon={faCogs}
                onClick={() => showFilters$.set((state) => !state)}
              />
            </h1>
            {showFilters$.value ? (
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
                <ToggleButton
                  css={{ marginBottom: 8, marginLeft: 8 }}
                  value={includeTrash$.value}
                  onChange={(value) => includeTrash$.set(value)}
                >
                  Include recipes in trash
                </ToggleButton>
                <Select
                  isMulti
                  placeholder="Suggest recipes that use..."
                  css={{ marginBottom: 16, maxWidth: 600 }}
                  options={Object.values(
                    Object.fromEntries(
                      (recipes || [])
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
                      ingredientBoosts: ((options ||
                        []) as OptionsType<OptionTypeBase>).map(
                        (option) => option.value
                      ),
                    }))
                  }
                ></Select>
                <Select
                  isMulti
                  placeholder="Choose recipes from tags..."
                  css={{ marginBottom: 16, maxWidth: 600 }}
                  options={Array.from(
                    new Set((recipes || []).map((recipe) => recipe.tags).flat())
                  ).map((tag) => ({
                    value: tag,
                    label: tag,
                  }))}
                  onChange={(options) =>
                    setTagFilter(
                      (options as any[])?.map((option) => option.value)
                    )
                  }
                ></Select>
              </div>
            ) : null}
            <RecipeList
              recipes={
                getSuggestedRecipes(
                  recipes,
                  {
                    likes,
                    ingredients: [
                      ...(usePantry && pantry
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
                  {
                    ingredients: ingredientFilter,
                    tags: tagFilter,
                    exclusions: [
                      ...mealPlan.recipes.map((recipe) => recipe.slug),
                      ...(includeTrash$.value
                        ? []
                        : trash.map((trashItem) => trashItem.slug)),
                    ],
                  }
                ) || []
              }
              actions={[
                {
                  icon: faPlus,
                  onClick: (recipe) => (e) => {
                    household?.ref
                      .collection("mealplan")
                      .add({ slug: recipe.slug, ...insertMeta });
                    e.preventDefault();
                  },
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
          [Breakpoint.LAPTOP]: { display: "none" },
        }}
      >
        <YourHomeSection />
        <h2>Pantry</h2>
        <IngredientList
          ingredients={pantry?.items.map((item) => item.ingredient)}
        />
      </Stack>
    </Flex>
  );
}
