import styled from "@emotion/styled";
import { Darkmode } from "../styles/Darkmode";

export const Tag = styled.span({
  background: "#eee",
  borderRadius: 4,
  margin: 4,
  padding: "4px 8px",
  [Darkmode]: {
    background: "#333",
  },
});
