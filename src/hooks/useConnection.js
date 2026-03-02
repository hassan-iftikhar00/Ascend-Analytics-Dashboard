import { useContext } from "react";
import ConnectionCtx from "../contexts/ConnectionCtx";

export function useConnection() {
  return useContext(ConnectionCtx);
}
