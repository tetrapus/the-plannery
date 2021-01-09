import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useState } from "react";
import { AuthStateContext } from "../../data/auth-state";
import { Recipe } from "../../data/recipes";
import { TrashContext } from "../../data/trash";

interface Props {
  recipe: Recipe;
  [props: string]: any;
}

export const TrashButton = ({ recipe, ...rest }: Props) => {
  const [busy, setBusy] = useState<boolean>(false);
  const { household, insertMeta } = useContext(AuthStateContext);
  const trash = useContext(TrashContext).find(
    (trash) => trash.slug === recipe.slug
  );
  return (
    <FontAwesomeIcon
      icon={faTrash}
      css={{ color: trash ? "black" : "#ccc", opacity: busy ? 0.5 : 1 }}
      onClick={async (e) => {
        e.stopPropagation();
        e.preventDefault();
        setBusy(true);
        try {
          if (trash) {
            await trash.ref.delete();
          } else {
            await household?.ref
              ?.collection("trash")
              .add({ slug: recipe.slug, ...insertMeta });
          }
        } catch {}
        setBusy(false);
      }}
      {...rest}
    />
  );
};
