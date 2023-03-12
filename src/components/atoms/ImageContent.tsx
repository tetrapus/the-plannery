import { getOptimisedImg } from "data/ingredients";
import React, { ComponentProps, useState } from "react";
import { Lightbox } from "./Lightbox";

export function ImageContent(props: { width: number } & ComponentProps<"img">) {
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  if (!props.src) {
    return null;
  }
  return (
    <>
      {lightboxOpen ? (
        <Lightbox
          mainSrc={getOptimisedImg(props.src, window.innerWidth)}
          onCloseRequest={() => setLightboxOpen(false)}
        ></Lightbox>
      ) : null}
      {/* eslint-disable-next-line */}
      <img
        {...props}
        src={getOptimisedImg(props.src, props.width)}
        onClick={() => setLightboxOpen(true)}
        onError={(e) => (e.currentTarget.style.visibility = "hidden")}
      ></img>
    </>
  );
}
