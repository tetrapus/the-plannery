import React from "react";
import { Stack } from "./Stack";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface Props {
  mainSrc: string;
  onCloseRequest(): void;
}

export function Lightbox(props: Props) {
  return (
    <Stack
      css={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
        background: "rgba(0,0,0,0.5)",
      }}
      onClick={() => props.onCloseRequest()}
    >
      <div css={{ margin: "auto" }}>
        <TransformWrapper>
          <TransformComponent>
            <img
              src={props.mainSrc}
              alt=""
              css={{
                margin: "5vh 5vw",
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "scale-down",
              }}
            ></img>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </Stack>
  );
}
