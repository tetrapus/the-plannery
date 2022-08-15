import React, { useContext, useState } from "react";
import { Stack } from "../../components/atoms/Stack";
import { Recipe } from "../../data/recipes";
import { AuthStateContext } from "../../data/auth-state";
import { Flex } from "../../components/atoms/Flex";
import { TextInput } from "components/atoms/TextInput";
import { TextButton } from "components/atoms/TextButton";
import { AnimatedIconButton } from "components/atoms/AnimatedIconButton";
import genieLamp from "animations/genie-lamp.json";
import genie from "animations/genie.json";
import { LinkButton } from "components/atoms/LinkButton";
import { ErrorBanner } from "components/atoms/ErrorBanner";
import { RecipeEdits } from "./RecipeEdits";

export function Remixer({
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
