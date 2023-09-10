import { css } from "@emotion/core";
import styled from "@emotion/styled";
import { Darkmode } from "../styles/Darkmode";

export const CardStyle = css({
  borderRadius: 8,
  boxShadow: "none",
  border: "1px solid #eee",
  background: "white",
  [Darkmode]: {
    background: "black",
    border: "1px solid #333",
  },
});

export const Card = styled.div`
  ${CardStyle}
`;
