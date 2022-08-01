import React, { useContext, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { TagList } from "../../components/molecules/TagList";
import { Stack } from "../../components/atoms/Stack";
import { RecipeStep } from "./RecipeStep/RecipeStep";
import { Recipe, RecipeStep as RecipeStepT } from "../../data/recipes";
import Ingredient from "../../data/ingredients";
import {
  AuthStateContext,
  useHouseholdCollection,
  useHouseholdDocument,
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
import { Notable, NotableContext } from "./Notable";
import { TextInput } from "components/atoms/TextInput";
import { TextButton } from "components/atoms/TextButton";
import { AnimatedIconButton } from "components/atoms/AnimatedIconButton";
import genieLamp from "animations/genie-lamp.json";
import genie from "animations/genie.json";
import { LinkButton } from "components/atoms/LinkButton";
import { ErrorBanner } from "components/atoms/ErrorBanner";

interface Props {
  recipe: Recipe;
}

const Section = styled.div`
  padding: 12px;
`;

interface RecipeEdits {
  title: string;
  subtitle: string;
  ingredients: Ingredient[];
  method: RecipeStepT[];
}

function Remixer({
  recipe,
  onEdit,
}: {
  recipe: Recipe;
  onEdit: (edits: RecipeEdits) => void;
}) {
  const { household } = useContext(AuthStateContext);

  const [editRequest, setEditRequest] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);

  const [keyConfigExpanded, setKeyConfigExpanded] = useState<boolean>(false);
  const [keyInput, setKeyInput] = useState<string>("");
  const [apiInvalidError, setApiInvalidError] = useState<boolean>(false);

  return (
    <Flex css={{ flexGrow: 1, alignItems: "flex-end" }}>
      {keyConfigExpanded ? (
        <Stack>
          <b>Set an OpenAI key</b>
          <div>
            Add an{" "}
            <a
              href="https://beta.openai.com/account/api-keys"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkButton css={{ padding: 0, cursor: "pointer" }}>
                OpenAI API Key
              </LinkButton>
            </a>{" "}
            to use the recipe genie.
          </div>
          {apiInvalidError ? <ErrorBanner>Invalid API Key</ErrorBanner> : null}
          <Flex>
            <TextInput
              placeholder="Enter API Key Here"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.currentTarget.value);
                setApiInvalidError(false);
              }}
              css={{ flexGrow: 1 }}
            />
            <TextButton
              css={{ margin: "auto" }}
              onClick={async (e) => {
                const response = await fetch(
                  "https://api.openai.com/v1/models",
                  {
                    headers: {
                      Authorization: `Bearer ${keyInput}`,
                    },
                  }
                );
                const models = await response.json();
                if (!models.error) {
                  household?.ref.set(
                    { openAiApiKey: keyInput },
                    { merge: true }
                  );
                  setKeyConfigExpanded(false);
                  setExpanded(true);
                } else {
                  setApiInvalidError(true);
                  setKeyInput("");
                }
              }}
            >
              Save
            </TextButton>
          </Flex>
        </Stack>
      ) : null}
      {expanded ? (
        <TextInput
          placeholder="What is your wish?"
          onChange={(e) => setEditRequest(e.currentTarget.value)}
          css={{ flexGrow: 1 }}
        />
      ) : null}
      <AnimatedIconButton
        css={{
          marginLeft: "auto",
          ...(!expanded
            ? {
                opacity: 0.1,
                ":hover": { opacity: 1 },
                transition: "opacity 0.4s",
              }
            : {}),
        }}
        animation={loading ? genie : genieLamp}
        autoplay={loading}
        active={expanded}
        onClick={async () => {
          if (!household?.openAiApiKey) {
            setKeyConfigExpanded(true);
            return;
          }
          if (!expanded) {
            setExpanded(true);
            return;
          }
          setLoading(true);
          const request = await fetch("https://api.openai.com/v1/edits", {
            headers: {
              Authorization: `Bearer ${household.openAiApiKey}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              model: "text-davinci-edit-001",
              input: `${
                recipe.subtitle
                  ? `${recipe.name} (${recipe.subtitle})`
                  : recipe.name
              }

Ingredients:
${recipe.ingredients
  .map(
    (ingredient) =>
      `${ingredient.qty || 1} ${ingredient.unit || "unit"} of ${
        ingredient.type.name
      }`
  )
  .join("\n")}

Method:
${recipe.steps
  .map((step, idx) => `${idx + 1}. ${step.method.replace(/\n/g, "<br>")}`)
  .join("\n")}`,
              instruction: editRequest,
            }),
          });
          const body = await request.json();
          const updated = body.choices[0].text as string;
          const match = updated.match(
            /^(.*)\n\nIngredients:((\n+[\d.]+ .+? of .+)+)\n\nMethod:((\n+(\d+)\. ((.|\n)+))+)$/m
          );
          console.log("Match: ", match);
          if (match) {
            const [newTitle, newIngredients, newMethod] = [
              match[1],
              match[2],
              match[4],
            ];
            const titleMatch = newTitle.match(/^(.+) \((.+)\)$/);
            onEdit({
              title: titleMatch ? titleMatch[1] : newTitle,
              subtitle: titleMatch ? titleMatch[2] : "",
              ingredients: newIngredients
                .trim()
                .split("\n")
                .map((ingredientString) => {
                  const match = ingredientString.match(
                    /^([\d]+([.]\d+)?) (.+) of (.+)$/
                  );
                  if (match) {
                    const [, qtyString, , unit, ingredientName] = match;
                    const existing = recipe.ingredients.find(
                      (oldIngredient) =>
                        oldIngredient.type.name === ingredientName
                    );
                    return {
                      qty: parseFloat(qtyString),
                      unit: unit,
                      type: {
                        ...(existing?.type || {
                          id: ingredientName,
                          imageUrl: "#",
                        }),
                        name: ingredientName,
                      },
                    };
                  } else {
                    return {
                      type: {
                        name: ingredientString,
                        id: ingredientString,
                        imageUrl: "#",
                      },
                    };
                  }
                }),
              method: newMethod
                .split(/\n+\d+\. (.+)/m)
                .map((method) => method.replace(/<br>/g, "\n"))
                .filter((x) => x.trim().length)
                .map((method) => {
                  const oldStep = recipe.steps.find(
                    (step) => step.method === method
                  );
                  if (oldStep) {
                    return oldStep;
                  }
                  return {
                    method,
                    images: [],
                    ingredients: [],
                    timers: [],
                  };
                }),
            });
            setEditRequest("");
            setExpanded(false);
          }
          setLoading(false);
        }}
      />
    </Flex>
  );
}

export default function RecipeTemplate({ recipe }: Props) {
  const { household, insertMeta } = useContext(AuthStateContext);
  const [session, setSession] = useState<Session | undefined>();
  const users = useHouseholdCollection(
    (household) => household.collection("users"),
    (snapshot) =>
      Object.fromEntries(snapshot.docs.map((doc) => [doc.id, doc.data()]))
  );
  const notes = useHouseholdDocument(
    (doc) => doc.collection("notes").doc(recipe.slug),
    (snapshot) => ({
      [snapshot.id]: {
        ...snapshot.data(),
        ref: snapshot.ref,
      } as any,
    })
  );

  const [autoEdits, setAutoEdits] = useState<RecipeEdits | undefined>();

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

  const notableContext = {
    users: Object.values(users || {}) as firebase.User[],
    notes: notes || {
      [recipe.slug]: {
        ref: household.ref.collection("notes").doc(recipe.slug),
      },
    },
    edits: [],
  };

  if (autoEdits) {
    recipe.ingredients = autoEdits.ingredients;
    recipe.steps = autoEdits.method;
    recipe.name = autoEdits.title;
    recipe.subtitle = autoEdits.subtitle;
  }

  return (
    <NotableContext.Provider value={notableContext}>
      <div>
        <ImageContent
          src={recipe.imageUrl}
          css={{
            width: "100%",
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
            <Notable
              slug={recipe.slug}
              field={["description"]}
              value={recipe.description}
            >
              {(value) => <ReactMarkdown>{value}</ReactMarkdown>}
            </Notable>
            <Flex>
              <TagList items={recipe.tags}></TagList>
              <Remixer
                recipe={recipe}
                onEdit={(edits) => setAutoEdits(edits)}
              />
            </Flex>
          </Section>
          <Notable slug={recipe.slug} field={["ingredients"]} value={""}>
            {() => <IngredientsSection recipe={recipe} session={session} />}
          </Notable>
          {recipe.utensils.length ? (
            <Notable slug={recipe.slug} field={["utensils"]} value={""}>
              {() => (
                <Section>
                  <h2>Utensils</h2>
                  <TagList items={recipe.utensils}></TagList>
                </Section>
              )}
            </Notable>
          ) : null}
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
                  recipeSlug={recipe.slug}
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
                        [`steps.${idx}`]:
                          firebase.firestore.FieldValue.delete(),
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
    </NotableContext.Provider>
  );
}
