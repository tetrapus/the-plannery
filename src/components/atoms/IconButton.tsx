import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const IconButton = styled(FontAwesomeIcon)`
  font-size: 32px;
  margin: 0 8px;
  color: grey;
  &:hover {
    color: black;
    cursor: pointer;
  }
`;
