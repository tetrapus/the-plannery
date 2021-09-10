import React from "react";
import { Stack } from "../../components/atoms/Stack";
import { Flex } from "../../components/atoms/Flex";
import { getRecipes, Recipe, RecipesCollection } from "../../data/recipes";
import { Spinner } from "../../components/atoms/Spinner";
import { Breakpoint } from "../../components/styles/Breakpoint";
import { useSubscription } from "../../util/use-subscription";
import SuggestedRecipesSection from "pages/HomePage/SuggestedRecipesSection/SuggestedRecipesSection";

export function BrowsePage() {
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
          <SuggestedRecipesSection recipes={recipes} />
        </Stack>
      ) : (
        <Stack
          css={{
            maxWidth: "80vw",
            width: 800,
            height: 300,
            alignItems: "center",
          }}
        >
          <Spinner />
          Downloading recipe database...
        </Stack>
      )}
    </Flex>
  );
}
