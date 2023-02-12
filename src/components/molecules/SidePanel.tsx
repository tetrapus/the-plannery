import styled from "@emotion/styled";
import { Stack } from "components/atoms/Stack";
import { Breakpoint } from "components/styles/Breakpoint";
import { Darkmode } from "components/styles/Darkmode";

export const SidePanel = styled(Stack)({
  width: 400,
  height: "100vh",
  position: "sticky",
  top: 0,
  zIndex: 2,
  border: "1px solid #dedede",
  background: "white",
  borderRadius: 8,
  [Darkmode]: {
    borderColor: "black",
    background: "black",
  },
  [Breakpoint.MOBILE]: {
    width: "initial",
  },
});
