# CrvUSD lending PnL Calculator

PNL calculator for crvUSD deposits in LlamaLend Arbitrum vaults

https://lend.curve.fi/#/arbitrum/markets?type=supply

# Setup

1. Get an RPC URL from [Alchemy](https://www.alchemy.com/), the free tier should be enough.
2. Create a `.env` file and update the `RPC_URL` with your RPC URL. Also update the `START_BLOCK` with the block number of the first deposit in the vaults (can be found on [Arbiscan](https://arbiscan.io/)). This will avoid fetching too many events from the chain and exceed the RPC free tier limits.
3. Install dependencies with `bun install`
4. (optional) Update the `LLAMALEND_VAULTS` in `config.ts` with the vaults you want to include in the calculation, default are the crvUSD/wBTC and crvUSD/wETH lending vaults.

## Run

`bun index.ts --user <userAddress>`
