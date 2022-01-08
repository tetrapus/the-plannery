import React, { useContext, useEffect, useState } from "react";
import { OptionTypeBase } from "react-select";
import Select from "react-select";
import { Flex } from "../../../components/atoms/Flex";
import { Preference, Recipe } from "../../../data/recipes";
import { Stack } from "../../../components/atoms/Stack";
import { IconButton } from "../../../components/atoms/IconButton";
import {
  faAsterisk,
  faBan,
  faChevronDown,
  faChevronRight,
  faLessThan,
  faPlus,
  faThumbtack,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AuthStateContext } from "data/auth-state";
import { useStateObject } from "util/use-state-object";
import { Darkmode } from "../../../components/styles/Darkmode";

interface Props {
  recipes: Recipe[];
  preferences: Preference[];
}

export default function RecipeSearchSettingsSection({
  recipes,
  preferences,
}: Props) {
  const [options, setOptions] = useState<OptionTypeBase[] | undefined>();
  const showSavedPreferences = useStateObject<boolean>(false);
  const { household, insertMeta } = useContext(AuthStateContext);

  useEffect(() => {
    setTimeout(() => {
      setOptions([
        {
          value: "Liked recipes",
          type: "liked",
          label: <>Liked recipes</>,
          fullLabel: <>Liked recipes</>,
        },
        {
          value: "Disliked recipes",
          type: "disliked",
          label: <>Disliked recipes</>,
          fullLabel: <>Disliked recipes</>,
        },
        {
          value: "Recently cooked",
          type: "recent",
          label: <>Recently cooked</>,
          fullLabel: <>Recently cooked</>,
        },
        {
          value: "Ready to cook",
          type: "ready-to-cook",
          label: <>Ready to cook</>,
          fullLabel: <>Ready to cook</>,
        },
        {
          value: "Fast",
          type: "fast",
          label: <>Fast</>,
          fullLabel: <>Fast</>,
        },
        {
          value: "Easy",
          type: "easy",
          label: <>Easy</>,
          fullLabel: <>Easy</>,
        },
        ...Object.values(
          Object.fromEntries(
            (recipes || [])
              .map((recipe) => recipe.ingredients)
              .flat()
              .map((ingredient) => [ingredient.type.id, ingredient])
          )
        ).map((ingredient) => ({
          value: ingredient.type.id,
          type: "ingredient",
          label: <>{ingredient.type.name}</>,
          fullLabel: (
            <Flex css={{ alignItems: "center" }}>
              {ingredient.type.imageUrl ? (
                <img
                  src={ingredient.type.imageUrl}
                  css={{ height: 24, marginRight: 8 }}
                  alt=""
                />
              ) : null}
              {ingredient.type.name}
            </Flex>
          ),
        })),
        ...Array.from(
          new Set((recipes || []).map((recipe) => recipe.tags).flat())
        ).map((tag) => ({
          value: tag,
          type: "tag",
          label: <>#{tag}</>,
          fullLabel: <>#{tag}</>,
        })),
        ...Array.from(
          new Set((recipes || []).map((recipe) => recipe.utensils).flat())
        ).map((equipment) => ({
          value: equipment,
          type: "equipment",
          label: <>Requires: {equipment}</>,
          fullLabel: <>Requires: {equipment}</>,
        })),
      ]);
    }, 0);
  }, [recipes]);

  const filterOptions = [
    {
      value: "exclude",
      label: (
        <>
          <FontAwesomeIcon icon={faBan} css={{ marginRight: 8 }} />
          Exclude
        </>
      ),
    },
    {
      value: "reduce",
      label: (
        <>
          <FontAwesomeIcon icon={faLessThan} css={{ marginRight: 8 }} />
          Reduce
        </>
      ),
    },
    {
      value: "prefer",
      label: (
        <>
          <FontAwesomeIcon icon={faPlus} css={{ marginRight: 8 }} />
          Prefer
        </>
      ),
    },
    {
      value: "require",
      label: (
        <>
          <FontAwesomeIcon icon={faAsterisk} css={{ marginRight: 8 }} />
          Require
        </>
      ),
    },
  ];

  return (
    <div css={{ position: "relative" }}>
      <Select
        placeholder="Search ingredients, tags, or equipment"
        css={{
          marginBottom: 16,
          color: "black",
          [Darkmode]: { filter: "invert(1)", zIndex: 100 },
        }}
        options={options || []}
        isLoading={options === undefined}
        onChange={(option) => {
          household?.ref
            .collection("searchPreferences")
            .doc((option as any).value)
            .set({
              id: (option as any).value,
              type: (option as any).type,
              preference: "prefer",
              ...insertMeta,
            });
        }}
        value={null}
      ></Select>
      <Stack css={{ marginBottom: 16 }}>
        {[true, false].map((pinnedSection) => {
          const sectionPreferences = preferences.filter(
            ({ pinned }) =>
              pinnedSection === !!pinned &&
              (pinnedSection && showSavedPreferences.value ? true : !pinned)
          );
          return (
            <Stack
              css={{
                borderBottom: "1px solid #dedede",
                marginBottom: 4,
                paddingBottom: 4,
                [Darkmode]: {
                  borderBottom: "1px solid #444",
                },
              }}
              key={JSON.stringify(pinnedSection)}
            >
              {pinnedSection ? (
                <h3
                  css={{ marginLeft: 8 }}
                  onClick={() => showSavedPreferences.set((v) => !v)}
                >
                  Your Preferences{" "}
                  <IconButton
                    icon={
                      showSavedPreferences.value
                        ? faChevronDown
                        : faChevronRight
                    }
                    css={{ fontSize: 18 }}
                  />
                </h3>
              ) : /* <h3>

              Options
              <IconButton
                icon={
                  showSavedPreferences.value
                    ? faChevronDown
                    : faChevronRight
                }
                css={{ fontSize: 18 }}
              />
              </h3> */ null}
              {sectionPreferences.map(
                ({ id, preference, pinned, ref }, idx) => (
                  <Flex css={{ alignItems: "center" }} key={ref.id}>
                    {options?.find((option) => option.value === id)?.fullLabel}
                    <Select
                      css={{
                        width: 150,
                        marginLeft: "auto",
                        color: "black",
                        [Darkmode]: {
                          filter: "invert(1)",
                          zIndex: sectionPreferences.length - idx,
                        },
                      }}
                      options={filterOptions}
                      isSearchable={false}
                      onChange={(option: any) => {
                        ref.update({ preference: option.value });
                      }}
                      value={filterOptions.find(
                        (opt) => opt.value === preference
                      )}
                    ></Select>
                    <IconButton
                      icon={faThumbtack}
                      color={pinned ? "black" : undefined}
                      css={{ height: 24 }}
                      onClick={() => ref.update({ pinned: !pinned })}
                    />
                    <IconButton icon={faTimes} onClick={() => ref.delete()} />
                  </Flex>
                )
              )}
            </Stack>
          );
        })}
      </Stack>
    </div>
  );
}
