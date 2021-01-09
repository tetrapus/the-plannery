import React from "react";

export function PlaceholderImage() {
  return (
    <div
      css={{
        height: 42,
        width: 42,
        background:
          "linear-gradient(141deg, rgba(242,242,242,1) 0%, rgba(241,240,240,1) 35%, rgba(217,217,217,1) 100%)",
        borderRadius: 24,
        color: "white",
        fontSize: 34,
        textAlign: "center",
        alignItems: "center",
        margin: 3,
      }}
    >
      ?
    </div>
  );
}
