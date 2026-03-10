import React from "react";
import { AppContext } from "../app-context";

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext: Context must be used inside a AppProvider");
  }
  return context;
}

export function useSafeArea() {
  const { safeArea } = useAppContext();
  return safeArea;
}
