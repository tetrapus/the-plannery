import styled from "@emotion/styled";
import { Darkmode } from "components/styles/Darkmode";

export const TextInput = styled.input`
  margin: 8px 4px;
  height: 24px;
  border-radius: 0;
  border: none;
  border-bottom: 1px solid #aaa;
  padding: 4px 8px;
  font-size: 16px;
  &:focus {
    border-bottom: 1px solid #55050b;
  }
  &:focus-visible {
    outline: none;
  }
  ${Darkmode} {
    background: black;
    color: white;
    border-bottom: 1px solid #333;

    &:focus {
      border-bottom: 1px solid orange;
    }
  }
`;
