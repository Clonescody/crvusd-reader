import { getAddress } from "viem";

const RPC_URL = () => {
  if (!process.env.RPC_URL) {
    throw new Error("RPC_URL is not set");
  }
  return process.env.RPC_URL;
};

const START_BLOCK = () => {
  if (!process.env.START_BLOCK) {
    throw new Error("START_BLOCK is not set");
  }
  return BigInt(process.env.START_BLOCK);
};

const LLAMALEND_VAULTS = [
  {
    name: "crvUSD/wBTC",
    address: getAddress("0x60D38b12d22BF423F28082bf396ff8F28cC506B1"),
  },
  {
    name: "crvUSD/wETH",
    address: getAddress("0xd3cA9BEc3e681b0f578FD87f20eBCf2B7e0bb739"),
  },
];

export const Config = {
  RPC_URL,
  LLAMALEND_VAULTS,
  START_BLOCK,
};
