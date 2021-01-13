import { faCogs, faPlus } from "@fortawesome/free-solid-svg-icons";
import React, { useContext } from "react";
import { OptionsType, OptionTypeBase } from "react-select";
import Select from "react-select";
import { Flex } from "../../../components/atoms/Flex";
import { IconButton } from "../../../components/atoms/IconButton";
import { Stack } from "../../../components/atoms/Stack";
import { ToggleButton } from "../../../components/atoms/ToggleButton";
import { RecipeList } from "../../../components/organisms/RecipeList";
import { LikesContext } from "../../../data/likes";
import { PantryContext } from "../../../data/pantry";
import { getSuggestedRecipes, Recipe } from "../../../data/recipes";
import { TrashContext } from "../../../data/trash";
import { useStateObject } from "../../../util/use-state-object";
import {
  AuthStateContext,
  useHouseholdCollection,
} from "../../../data/auth-state";
import { MealPlanItem } from "../../../data/meal-plan";
import RecipeSearchSettingsSection from "./RecipeSearchSettingsSection";

interface Props {
  recipes: Recipe[];
}

export default function SuggestedRecipesSection({ recipes }: Props) {
  const showFilters$ = useStateObject<boolean>(false);
  const preferPantry$ = useStateObject<boolean>(false);
  const includeTrash$ = useStateObject<boolean>(false);
  const boostIngredients$ = useStateObject<string[]>([]);
  const filterIngredients$ = useStateObject<string[]>([]);
  const tagFilter$ = useStateObject<string[]>([]);

  const likes = useContext(LikesContext);
  const trash = useContext(TrashContext);
  const pantry = useContext(PantryContext);

  const mealPlan = useHouseholdCollection(
    (doc) => doc.collection("mealplan"),
    (snapshot) => ({
      recipes: snapshot.docs.map(
        (doc) => ({ ref: doc.ref, ...doc.data() } as MealPlanItem)
      ),
    })
  );
  const { household, insertMeta } = useContext(AuthStateContext);

  if (!mealPlan) {
    return null;
  }

  return (
    <Stack>
      <h1>
        Suggested for you
        <IconButton
          icon={faCogs}
          onClick={() => showFilters$.set((state) => !state)}
        />
      </h1>
      {showFilters$.value ? (
        <>
          <RecipeSearchSettingsSection recipes={recipes} />
          {false && (
            <div css={{ position: "relative" }}>
              <ToggleButton
                css={{ marginBottom: 8 }}
                value={preferPantry$.value}
                onChange={(value) => preferPantry$.set(value)}
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
                      {ingredient.type.imageUrl ? (
                        <img
                          src={ingredient.type.imageUrl}
                          css={{ height: 16, marginRight: 8 }}
                          alt=""
                        />
                      ) : null}
                      {ingredient.type.name}
                    </Flex>
                  ),
                }))}
                onChange={(options) =>
                  boostIngredients$.set(
                    ((options || []) as OptionsType<OptionTypeBase>).map(
                      (option) => option.value
                    )
                  )
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
                  tagFilter$.set(
                    (options as any[])?.map((option) => option.value)
                  )
                }
              ></Select>
            </div>
          )}
        </>
      ) : null}
      <RecipeList
        recipes={
          getSuggestedRecipes(
            recipes,
            {
              likes,
              ingredients: [
                ...(preferPantry$.value && pantry
                  ? pantry.items
                      .filter(
                        (item) => item.ingredient.unit || item.ingredient.qty
                      )
                      .map((item) => item.ingredient.type.id)
                  : []),
                ...boostIngredients$.value,
              ],
            },
            {
              ingredients: filterIngredients$.value,
              tags: tagFilter$.value,
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
    </Stack>
  );
}
