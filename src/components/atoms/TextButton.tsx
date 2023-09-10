import styled from "@emotion/styled";
import { Darkmode } from "components/styles/Darkmode";

export const TextButton = styled.button({
  background: "white",
  border: "1px solid darkred",
  boxShadow: "2px 2px 0 0 orange",
  padding: "8px 12px",
  borderRadius: 8,
  fontSize: 18,
  transform: "translateX(0) translateY(0)",
  transition:
    "transform 0.05s linear, box-shadow 0.05s ease-in-out, color 0.05s ease-in-out",
  ":active, .busy": {
    transform: "translateX(2px) translateY(2px)",
    boxShadow: "none",
    color: "grey",
  },
  [Darkmode]: {
    background: "black",
    color: "white",
    border: "1px solid orange",
    boxShadow: "2px 2px 0 0 darkred",
  },
});
