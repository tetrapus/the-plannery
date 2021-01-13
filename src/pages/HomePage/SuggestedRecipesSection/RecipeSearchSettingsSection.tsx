import React, { useEffect, useState } from "react";
import { OptionsType, OptionTypeBase } from "react-select";
import Select from "react-select";
import { Flex } from "../../../components/atoms/Flex";
import { Recipe } from "../../../data/recipes";
import { useStateObject } from "../../../util/use-state-object";
import { Stack } from "../../../components/atoms/Stack";
import { IconButton } from "../../../components/atoms/IconButton";
import {
  faAsterisk,
  faBan,
  faCross,
  faLessThan,
  faPlus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  recipes: Recipe[];
}

interface Preference {
  id: string;
  type: "ingredient";
  preference: "exclude" | "reduce " | "prefer" | "require";
}

export default function RecipeSearchSettingsSection({ recipes }: Props) {
  const tagFilter$ = useStateObject<string[]>([]);
  const [options, setOptions] = useState<OptionTypeBase[] | undefined>();
  const preferences$ = useStateObject<Preference[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setOptions(
        Object.values(
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
                  css={{ height: 24, marginRight: 8 }}
                  alt=""
                />
              ) : null}
              {ingredient.type.name}
            </Flex>
          ),
        }))
      );
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
        placeholder="Search ingredients"
        css={{ marginBottom: 16 }}
        options={options || []}
        isLoading={options === undefined}
        onChange={(option) => {
          preferences$.set((value) => [
            ...value,
            {
              id: (option as { value: string }).value,
              type: "ingredient",
              preference: "prefer",
            },
          ]);
        }}
        value={null}
      ></Select>
      <Stack css={{ marginBottom: 16 }}>
        {preferences$.value.map(({ id, preference }) => (
          <Flex css={{ alignItems: "center" }}>
            {options?.find((option) => option.value === id)?.label}
            <Select
              css={{ width: 150, marginLeft: "auto" }}
              options={filterOptions}
              onChange={(option: any) => {
                preferences$.set((values) =>
                  values.map((value) =>
                    value.id === id
                      ? { ...value, preference: option.value }
                      : value
                  )
                );
              }}
              value={filterOptions.find((opt) => opt.value === preference)}
            ></Select>
            <IconButton
              icon={faTimes}
              onClick={() =>
                preferences$.set((values) =>
                  values.filter((value) => value.id !== id)
                )
              }
            />
          </Flex>
        ))}
      </Stack>
      {false && (
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
            tagFilter$.set((options as any[])?.map((option) => option.value))
          }
        ></Select>
      )}
    </div>
  );
}
