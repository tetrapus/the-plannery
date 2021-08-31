import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useState } from "react";
import { LikesContext } from "../../data/likes";
import { Recipe } from "../../data/recipes";
import { AuthStateContext } from "../../data/auth-state";
import firebase from "firebase";

interface Props {
  recipe: Recipe;
  [key: string]: any;
}

export function LikeButton({ recipe, ...rest }: Props) {
  const [busy, setBusy] = useState<boolean>(false);
  const { household, insertMeta } = useContext(AuthStateContext);
  const like = useContext(LikesContext).find(
    (like) => like.slug === recipe.slug
  );
  return (
    <FontAwesomeIcon
      icon={faHeart}
      css={{
        color: like ? "hotpink" : "#ccc",
        opacity: busy ? 0.5 : 1,
      }}
      onClick={async (e) => {
        e.stopPropagation();
        e.preventDefault();
        setBusy(true);
        try {
          if (like) {
            if (like.ref) {
              await like.ref.delete();
            } else {
              await household?.ref
                ?.collection("blobs")
                .doc("likes")
                .set(
                  { [recipe.slug]: firebase.firestore.FieldValue.delete() },
                  { merge: true }
                );
            }
          } else {
            await household?.ref
              ?.collection("blobs")
              .doc("likes")
              .set(
                { [recipe.slug]: { slug: recipe.slug, ...insertMeta } },
                { merge: true }
              );
          }
        } catch {}
        setBusy(false);
      }}
      {...rest}
    />
  );
}
