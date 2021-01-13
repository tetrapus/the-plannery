import styled from "@emotion/styled";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";

type IconButtonProps = {
  iconSize?: number;
} & FontAwesomeIconProps;

export const IconButton = styled(FontAwesomeIcon)<IconButtonProps>`
  font-size: ${(props) => (props.iconSize ? props.iconSize : 32)}px;
  margin: 0 8px;
  color: ${(props) => (props.color ? props.color : "grey")};
  &:hover {
    color: black;
    cursor: pointer;
  }
`;
