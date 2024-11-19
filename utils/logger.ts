const logVaultValues = (
  vault: string,
  values: {
    depositedInVault: number;
    withdrawFromVault: number;
    currentBalance: number;
    vaultProfits: number;
  }
) => {
  console.log(vault, "vault");
  console.log("Deposited in vault: ", values.depositedInVault);
  console.log("Withdrawn from vault: ", values.withdrawFromVault);
  console.log("Current balance    : ", values.currentBalance);
  console.log("Vault profit      : ", values.vaultProfits);
  console.log("--------------------------------\n");
};

const logTotalValues = (
  totalDeposited: number,
  totalWithdraw: number,
  totalRedeemValue: number,
  totalProfits: number
) => {
  console.log("Total deposited amount  : ", totalDeposited);
  console.log("Total withdrawn amount   : ", totalWithdraw);
  console.log("Total current balance   : ", totalRedeemValue);
  console.log("Total profits   : ", totalProfits);
  console.log("\n");
};

export const Logger = {
  logVaultValues,
  logTotalValues,
};
