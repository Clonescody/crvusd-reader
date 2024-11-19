export const LLAMA_LEND_VAULT_ABI = {
  abi: [
    {
      name: "Deposit",
      inputs: [
        { name: "sender", type: "address", indexed: true },
        { name: "owner", type: "address", indexed: true },
        { name: "assets", type: "uint256", indexed: false },
        { name: "shares", type: "uint256", indexed: false },
      ],
      anonymous: false,
      type: "event",
    },
    {
      name: "Withdraw",
      inputs: [
        { name: "sender", type: "address", indexed: true },
        { name: "receiver", type: "address", indexed: true },
        { name: "owner", type: "address", indexed: true },
        { name: "assets", type: "uint256", indexed: false },
        { name: "shares", type: "uint256", indexed: false },
      ],
      anonymous: false,
      type: "event",
    },
    {
      stateMutability: "view",
      type: "function",
      name: "balanceOf",
      inputs: [{ name: "arg0", type: "address" }],
      outputs: [{ name: "", type: "uint256" }],
    },
    {
      stateMutability: "view",
      type: "function",
      name: "previewRedeem",
      inputs: [{ name: "shares", type: "uint256" }],
      outputs: [{ name: "", type: "uint256" }],
    },
  ],
} as const;
