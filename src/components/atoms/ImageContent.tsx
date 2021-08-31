import React, { useState } from "react";
import { Lightbox } from "./Lightbox";

export function ImageContent(props: any) {
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  return (
    <>
      {lightboxOpen ? (
        <Lightbox
          mainSrc={props.src}
          onCloseRequest={() => setLightboxOpen(false)}
        ></Lightbox>
      ) : null}
      {/* eslint-disable-next-line */}
      <img
        {...props}
        onClick={() => setLightboxOpen(true)}
        onError={(e) => (e.currentTarget.style.visibility = "hidden")}
      ></img>
    </>
  );
}
