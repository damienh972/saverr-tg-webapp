import { ConnectButton, TransactionButton, useActiveAccount } from "thirdweb/react";
import { sepolia } from "thirdweb/chains";
import { getContract, prepareContractCall } from "thirdweb";
import { thirdwebClient } from "../lib/thirdwebClient";
import { toUSDC } from "../lib/transactionUtils";

const depositAddress = "0x4c0FeD497BC2868E1010C8eC8bEfcfCd3013601b";

export const TransferButton = ({amount,
  callback,
}: {
  amount: number;
  callback: (result: any) => void;
}) => {
  const account = useActiveAccount();
  if (!account) {
    return <ConnectButton client={thirdwebClient} accountAbstraction={{
      chain: sepolia,
      sponsorGas: true
    }} />;
  }

  const contract = getContract({
    client: thirdwebClient,
    chain: sepolia,
    address: "0x6B450d0772914E74D933264A5e5c9059071CF08D",
  });

  return (
    <TransactionButton
      transaction={() =>
        prepareContractCall({
          contract,
          method: "function transfer(address to, uint256 value)",
          params: [depositAddress, toUSDC(amount)],
        })
      }
      onTransactionSent={(result) =>
        console.log("TX envoyée:", result.transactionHash)
      }
      onTransactionConfirmed={(receipt) => {
        console.log(
          "TX confirmée:",
          receipt.transactionHash,
          callback("TRANSFERRED")
        );
      }}
      onError={(error) => console.error("Erreur:", error)}
      payModal={false}
    >
      ✅ Valider le transfer
    </TransactionButton>
  );
};
