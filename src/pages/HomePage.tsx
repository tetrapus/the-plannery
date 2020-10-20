import React from "react";
import HomeTemplate from "../components/templates/HomeTemplate";
import { LoggedInBaseTemplate } from "../components/templates/LoggedInBaseTemplate";

export default function HomePage() {
  return (
    <LoggedInBaseTemplate>
      <HomeTemplate />
    </LoggedInBaseTemplate>
  );
}
