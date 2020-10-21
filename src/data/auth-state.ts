import React from "react";

interface AuthState {
  loading: boolean;
  currentUser?: any;
}

export const AuthStateContext = React.createContext<AuthState>({
  loading: true,
});
