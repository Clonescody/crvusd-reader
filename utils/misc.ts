import { SupportedChain } from "../config";

export const isSupportedChain = (
  value: SupportedChain | string
): value is SupportedChain => {
  return Object.values(SupportedChain).includes(value as SupportedChain);
};
