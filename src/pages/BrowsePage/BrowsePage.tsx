import { Flex } from "components/atoms/Flex";
import { Spinner } from "components/atoms/Spinner";
import { Stack } from "components/atoms/Stack";
import { Breakpoint } from "components/styles/Breakpoint";
import { useRecipes } from "data/recipes";
import SuggestedRecipesSection from "pages/HomePage/SuggestedRecipesSection/SuggestedRecipesSection";
import React from "react";

export function BrowsePage() {
  const recipes = useRecipes();

  return (
    <Flex css={{ margin: "auto" }}>
      {recipes ? (
        <Stack
          css={{
            maxWidth: 800,
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
