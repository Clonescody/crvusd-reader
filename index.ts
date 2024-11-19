import {
  formatUnits,
  getAddress,
  isAddress,
  createPublicClient,
  http,
  type Address,
} from "viem";

import { arbitrum } from "viem/chains";
import { LLAMA_LEND_VAULT_ABI } from "./datas/abis/LLAMA_LEND_VAULT";
import { Logger } from "./utils/logger";
import { Config } from "./config";

const publicClient = createPublicClient({
  chain: arbitrum,
  transport: http(Config.RPC_URL()),
  batch: {
    multicall: true,
  },
});

const depositsWithdrawForVault = async (
  vault: Address,
  userAddress: Address
): Promise<{ depositedInVault: number; withdrawFromVault: number }> => {
  const [depositFilter, withdrawFilter] = await Promise.all([
    publicClient.createContractEventFilter({
      address: vault,
      abi: LLAMA_LEND_VAULT_ABI.abi,
      eventName: "Deposit",
      fromBlock: Config.START_BLOCK(),
      args: {
        owner: userAddress,
      },
      strict: true,
    }),
    publicClient.createContractEventFilter({
      address: vault,
      abi: LLAMA_LEND_VAULT_ABI.abi,
      eventName: "Withdraw",
      fromBlock: Config.START_BLOCK(),
      args: {
        owner: userAddress,
      },
      strict: true,
    }),
  ]);

  const [depositLogs, withdrawLogs] = await Promise.all([
    publicClient.getFilterLogs({
      filter: depositFilter,
    }),
    publicClient.getFilterLogs({
      filter: withdrawFilter,
    }),
  ]);

  const allLogs = [...depositLogs, ...withdrawLogs];

  let depositedInVault = 0;
  let withdrawFromVault = 0;

  allLogs.forEach((log) => {
    if (log.eventName === "Deposit") {
      depositedInVault += Number(formatUnits(log.args.assets, 18));
    } else {
      withdrawFromVault += Number(formatUnits(log.args.assets, 18));
    }
  });

  return { depositedInVault, withdrawFromVault };
};

const readCurrentBalanceForVault = async (
  vault: Address,
  userAddress: Address
): Promise<number> => {
  const balanceOf = await publicClient.readContract({
    address: vault,
    abi: LLAMA_LEND_VAULT_ABI.abi,
    functionName: "balanceOf",
    args: [userAddress],
  });
  const redeemValue = await publicClient.readContract({
    address: vault,
    abi: LLAMA_LEND_VAULT_ABI.abi,
    functionName: "previewRedeem",
    args: [balanceOf],
  });

  return Number(formatUnits(redeemValue, 18));
};

const main = async () => {
  const userAddressRaw = Bun.argv[Bun.argv.length - 1];
  if (!isAddress(userAddressRaw)) {
    throw new Error("Invalid user address");
  }
  const userAddress = getAddress(userAddressRaw);
  let totalDeposited = 0;
  let totalWithdraw = 0;
  let totalRedeemValue = 0;
  let totalProfits = 0;
  console.log("\n");
  for (const vault of Config.LLAMALEND_VAULTS) {
    const [depositsWithdraw, currentBalance] = await Promise.all([
      depositsWithdrawForVault(vault.address, userAddress),
      readCurrentBalanceForVault(vault.address, userAddress),
    ]);
    const { depositedInVault, withdrawFromVault } = depositsWithdraw;
    totalDeposited += depositedInVault;
    totalWithdraw += withdrawFromVault;
    totalRedeemValue += currentBalance;
    const vaultProfits = currentBalance - depositedInVault + withdrawFromVault;
    totalProfits += vaultProfits;
    Logger.logVaultValues(vault.name, {
      depositedInVault,
      withdrawFromVault,
      currentBalance,
      vaultProfits,
    });
  }
  Logger.logTotalValues(
    totalDeposited,
    totalWithdraw,
    totalRedeemValue,
    totalProfits
  );
};

main();
