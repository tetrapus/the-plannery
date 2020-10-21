import { css } from "@emotion/core";
import styled from "@emotion/styled";

export const CardStyle = css({
  borderRadius: 3,
  boxShadow: "grey 1px 1px 3px",
  background: "white",
});

export const Card = styled.div`
  ${CardStyle}
`;
