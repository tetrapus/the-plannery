import React from "react";
import { Link } from "react-router-dom";
import { Flex } from "../atoms/Flex";

export default function NavigationBar() {
  return (
    <Flex
      css={{
        backgroundColor: `white`,
        borderBottom: `1px solid grey`,
        height: 64,
        paddingLeft: 16,
      }}
    >
      <Link to="/">
        <img
          src="/logo.png"
          css={{ objectFit: `cover`, height: "100%" }}
          alt="The Plannery Logo"
        />
      </Link>
    </Flex>
  );
}
