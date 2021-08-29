import { Flex } from "components/atoms/Flex";
import { Stack } from "components/atoms/Stack";
import { TextInput } from "components/atoms/TextInput";
import { Darkmode } from "components/styles/Darkmode";
import React, { HTMLProps } from "react";

export function QuantityInput({
  suffix,
  inputRef,
  ...props
}: HTMLProps<HTMLInputElement> & {
  suffix?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <Flex
      css={{
        borderBottom: "1px solid #dedede",
        fontSize: 24,
        background: "#f0f0f0",
        flexGrow: 1,
        ":focus-within": { borderBottom: "1px solid #55050b" },
        [Darkmode]: {
          background: "black",
        },
      }}
    >
      <TextInput
        {...props}
        type="number"
        ref={inputRef}
        css={{
          height: "auto",
          borderBottom: "none !important",
          fontSize: 24,
          textAlign: "center",
          background: "#f0f0f0",
          width: "100%",
        }}
        onFocus={(event) => event.target.select()}
      ></TextInput>
      {suffix ? (
        <Stack
          css={{
            justifyContent: "center",
            textTransform: "lowercase",
            paddingBottom: 3,
            color: "grey",
            paddingRight: 16,
          }}
        >
          {suffix}
        </Stack>
      ) : null}
    </Flex>
  );
}
