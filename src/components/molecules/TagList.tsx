import React from "react";
import { Flex } from "../atoms/Flex";
import { Tag } from "../atoms/Tag";

interface Props {
  items: string[];
}

export function TagList({ items }: Props) {
  return (
    <Flex css={{ flexWrap: "wrap" }}>
      {items.map((item) => (
        <Tag key={item}>{item}</Tag>
      ))}
    </Flex>
  );
}
