import { createContext } from "react";

const ConnectionCtx = createContext({ dbDown: false });
export default ConnectionCtx;
