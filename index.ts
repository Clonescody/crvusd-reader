import {
  formatUnits,
  getAddress,
  isAddress,
  type Address,
  type PublicClient,
} from "viem";

import { LLAMA_LEND_VAULT_ABI } from "./datas/abis/LLAMA_LEND_VAULT";
import { Logger } from "./utils/logger";
import { Config, SupportedChain, type ApiVault, type Vault } from "./config";
import { Parser } from "./utils/parser";
import { isSupportedChain } from "./utils/misc";

const fetchVaultsList = async (chain: SupportedChain): Promise<Vault[]> => {
  const url = `https://api.curve.fi/v1/getLendingVaults/all/${chain}`;

  const response = await Bun.fetch(url);
  const {
    data: { lendingVaultData: vaults },
  } = await response.json();

  return vaults.map((vault: ApiVault) => ({
    name: `${vault.assets.borrowed.symbol}/${vault.assets.collateral.symbol}`,
    address: getAddress(vault.address),
  }));
};

const depositsWithdrawForVault = async (
  publicClient: PublicClient,
  chain: SupportedChain,
  vault: Address,
  userAddress: Address
): Promise<{
  depositedInVault: number;
  withdrawFromVault: number;
  hasLogs: boolean;
}> => {
  const [depositFilter, withdrawFilter] = await Promise.all([
    publicClient.createContractEventFilter({
      address: vault,
      abi: LLAMA_LEND_VAULT_ABI.abi,
      eventName: "Deposit",
      fromBlock: Config.START_BLOCK[chain],
      args: {
        owner: userAddress,
      },
      strict: true,
    }),
    publicClient.createContractEventFilter({
      address: vault,
      abi: LLAMA_LEND_VAULT_ABI.abi,
      eventName: "Withdraw",
      fromBlock: Config.START_BLOCK[chain],
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

  return { depositedInVault, withdrawFromVault, hasLogs: allLogs.length > 0 };
};

const readCurrentBalanceForVault = async (
  publicClient: PublicClient,
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
  const { user, chain } = Parser.parseArgs(Bun.argv);
  if (!isAddress(user)) {
    throw new Error(`Invalid user address: ${user}`);
  }
  if (!isSupportedChain(chain)) {
    throw new Error(`Invalid chain: ${chain}`);
  }
  const userAddress = getAddress(user);
  const publicClient = Config.VIEM_CLIENT[chain];

  let totalDeposited = 0;
  let totalWithdraw = 0;
  let totalRedeemValue = 0;
  let totalProfits = 0;

  const vaultsList = await fetchVaultsList(chain);
  await Promise.all(
    vaultsList.map(async (vault) => {
      const depositsWithdraw = await depositsWithdrawForVault(
        publicClient,
        chain,
        vault.address,
        userAddress
      );
      const { depositedInVault, withdrawFromVault, hasLogs } = depositsWithdraw;
      if (!hasLogs) {
        return;
      }
      const currentBalance = await readCurrentBalanceForVault(
        publicClient,
        vault.address,
        userAddress
      );
      totalDeposited += depositedInVault;
      totalWithdraw += withdrawFromVault;
      totalRedeemValue += currentBalance;
      const vaultProfits =
        currentBalance - depositedInVault + withdrawFromVault;
      totalProfits += vaultProfits;
      Logger.logVaultValues(vault.name, {
        depositedInVault,
        withdrawFromVault,
        currentBalance,
        vaultProfits,
      });
    })
  );

  Logger.logTotalValues(
    totalDeposited,
    totalWithdraw,
    totalRedeemValue,
    totalProfits
  );
  process.exit(0);
};

main();
