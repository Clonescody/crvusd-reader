import {
  createPublicClient,
  getAddress,
  http,
  type Address,
  type PublicClient,
} from "viem";
import { arbitrum, fraxtal, optimism, mainnet } from "viem/chains";

export type ApiVault = {
  name: string;
  address: string;
  assets: {
    borrowed: {
      symbol: string;
    };
    collateral: {
      symbol: string;
    };
  };
};

export type Vault = {
  name: string;
  address: Address;
};

export enum SupportedChain {
  Ethereum = "ethereum",
  Arbitrum = "arbitrum",
  //   Fraxtal = "fraxtal",
  //   Optimism = "optimism",
}

const getRpcUrl = (chain: SupportedChain): string | undefined => {
  if (!process.env[`${chain.toUpperCase()}_RPC_URL`]) {
    throw new Error(`${chain.toUpperCase()}_RPC_URL is not set`);
  }
  return process.env[`${chain.toUpperCase()}_RPC_URL`];
};

const VIEM_CLIENT: Record<SupportedChain, PublicClient> = {
  [SupportedChain.Arbitrum]: createPublicClient({
    chain: arbitrum,
    transport: http(getRpcUrl(SupportedChain.Arbitrum)),
    batch: {
      multicall: true,
    },
  }),
  [SupportedChain.Ethereum]: createPublicClient({
    chain: mainnet,
    transport: http(getRpcUrl(SupportedChain.Ethereum)),
    batch: {
      multicall: true,
    },
  }),
  //   [SupportedChain.Fraxtal]: createPublicClient({
  //     chain: fraxtal,
  //     transport: http(getRpcUrl(SupportedChain.Fraxtal)),
  //     batch: {
  //       multicall: true,
  //     },
  //   }),
  //   [SupportedChain.Optimism]: createPublicClient({
  //     chain: optimism,
  //     transport: http(getRpcUrl(SupportedChain.Optimism)),
  //     batch: {
  //       multicall: true,
  //     },
  //   }),
};

const START_BLOCK: Record<SupportedChain, bigint> = {
  [SupportedChain.Ethereum]: BigInt(19422666),
  [SupportedChain.Arbitrum]: BigInt(193652607),
  //   [SupportedChain.Fraxtal]: BigInt(9466075),
  //   [SupportedChain.Optimism]: BigInt(125072267),
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
  LLAMALEND_VAULTS,
  VIEM_CLIENT,
  START_BLOCK,
};
