import React, { useContext, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { TagList } from "../../components/molecules/TagList";
import { Stack } from "../../components/atoms/Stack";
import { RecipeStep } from "./RecipeStep/RecipeStep";
import { Recipe } from "../../data/recipes";
import Ingredient from "../../data/ingredients";
import {
  AuthStateContext,
  useHouseholdCollection,
} from "../../data/auth-state";
import { LikeButton } from "../../components/molecules/LikeButton";
import { faPlayCircle, faStopCircle } from "@fortawesome/free-solid-svg-icons";
import firebase from "firebase";
import { Flex } from "../../components/atoms/Flex";
import { IconButton } from "../../components/atoms/IconButton";
import { Session } from "../../data/session";
import IngredientsSection from "./IngredientsSection";
import styled from "@emotion/styled";
import { Darkmode } from "../../components/styles/Darkmode";
import { Breakpoint } from "../../components/styles/Breakpoint";
import { ImageContent } from "../../components/atoms/ImageContent";
import { ExternalLink } from "../../components/atoms/ExternalLink";

interface Props {
  recipe: Recipe;
}

const Section = styled.div`
  padding: 12px;
`;

export default function RecipeTemplate({ recipe }: Props) {
  const { household, insertMeta } = useContext(AuthStateContext);
  const [session, setSession] = useState<Session | undefined>();
  const users = useHouseholdCollection(
    (household) => household.collection("users"),
    (snapshot) =>
      Object.fromEntries(snapshot.docs.map((doc) => [doc.id, doc.data()]))
  );
  useEffect(
    () =>
      household?.ref
        .collection("sessions")
        .doc(recipe.slug)
        .onSnapshot((snapshot) =>
          setSession(
            snapshot.exists
              ? { ...(snapshot.data() as Session), ref: snapshot.ref }
              : undefined
          )
        ),
    [household, recipe.slug]
  );

  if (!household) {
    return null;
  }

  return (
    <div>
      <ImageContent
        src={recipe.imageUrl}
        css={{
          width: "100vw",
          minHeight: "50vh",
          height: "50vh",
          objectFit: "cover",
          position: "relative",
          top: -64,
          [Breakpoint.TABLET]: {
            position: "initial",
            minHeight: "25vh",
          },
        }}
        alt={recipe.name}
      ></ImageContent>
      <div
        css={{
          backgroundColor: "white",
          maxWidth: 800,
          margin: "auto",
          position: "relative",
          top: "-40vh",
          [Breakpoint.TABLET]: {
            top: "-25vh",
          },
          minHeight: "100vh",
          boxShadow: "gray 1px 1px 4px",
          borderRadius: 2,
          [Darkmode]: {
            backgroundColor: "black",
            boxShadow: "black 1px 1px 4px",
          },
        }}
      >
        <Section>
          <Stack css={{ alignItems: `center` }}>
            <ExternalLink href={recipe.url}>
              <h1 css={{ margin: "12px 24px", fontWeight: "bold" }}>
                {recipe.name}
              </h1>
            </ExternalLink>
            <LikeButton
              recipe={recipe}
              css={{ position: "absolute", top: 16, right: 16, fontSize: 24 }}
            />
            <h2 css={{ margin: 0 }}>{recipe.subtitle}</h2>
          </Stack>

          <ReactMarkdown>{recipe.description}</ReactMarkdown>
          <TagList items={recipe.tags}></TagList>
        </Section>
        <IngredientsSection recipe={recipe} session={session} />
        <Section>
          <h2>Utensils</h2>
          <TagList items={recipe.utensils}></TagList>
        </Section>
        <Section>
          <h2>
            <Flex>
              Method
              <IconButton
                icon={session ? faStopCircle : faPlayCircle}
                onClick={() =>
                  session
                    ? session.ref.delete()
                    : household.ref
                        .collection("sessions")
                        .doc(recipe.slug)
                        .set({ ...insertMeta, steps: {} })
                }
              />
            </Flex>
          </h2>
          <div>
            {recipe.steps.map((step, idx) => (
              <RecipeStep
                key={idx}
                step={step}
                stepNumber={idx + 1}
                users={users}
                ingredients={step.ingredients
                  .map((ingredient) =>
                    recipe.ingredients.find(
                      (recipeIngredient) =>
                        recipeIngredient.type.id === ingredient
                    )
                  )
                  .filter(
                    (ingredient): ingredient is Ingredient =>
                      ingredient !== undefined
                  )}
                state={session?.steps ? session?.steps[`${idx}`] : undefined}
                onClick={() => {
                  if (!session) {
                    return;
                  }
                  if (!session.steps[`${idx}`]) {
                    session.ref.update({
                      [`steps.${idx}`]: { ...insertMeta, state: "claimed" },
                    });
                  } else if (session.steps[`${idx}`].state === "done") {
                    session.ref.update({
                      [`steps.${idx}`]: firebase.firestore.FieldValue.delete(),
                    });
                  } else if (session.steps[`${idx}`].state === "claimed") {
                    session.ref.update({
                      [`steps.${idx}`]: { ...insertMeta, state: "done" },
                    });
                  }
                }}
              ></RecipeStep>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
