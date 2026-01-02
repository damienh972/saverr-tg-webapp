
import {
  ConnectButton,
  TransactionButton,
  useActiveAccount,
} from "thirdweb/react";
import { sepolia } from "thirdweb/chains";
import { getContract, prepareContractCall } from "thirdweb";
import { thirdwebClient } from "../lib/thirdwebClient";
import { toUSDC } from "../lib/transactionUtils";
import { useMemo } from "react";
import { inAppWallet } from "thirdweb/wallets";

const depositAddress = "0x4c0FeD497BC2868E1010C8eC8bEfcfCd3013601b";

export const TransferButton = ({
  buttonText,
  amount,
  callback,
  isTransfer = false,
  txId = null
}: {
  buttonText: string;
  amount: number;
  callback: (result: any) => void;
  isTransfer?: boolean;
  txId?: string | null;
}) => {
  const account = useActiveAccount();
  const wallets = useMemo(
      () => [
        inAppWallet({
          auth: {
            options: ["email", "google"],
          }
        }),
      ],
      []
  );
  
  if (!account?.address) {
    return (
      <ConnectButton
        client={thirdwebClient}
        wallets={wallets}
        accountAbstraction={{
          chain: sepolia,
          sponsorGas: true,
        }}
        connectButton={{ label: "Je me connecte", className: "btn" }}
      />
    );
  }

  const contract = getContract({
    client: thirdwebClient,
    chain: sepolia,
    address: "0x6359b6B9D0E3C8836160B99aEe77a0aB1F71b34E",
  });

  return (
    <TransactionButton
      transaction={() =>
        prepareContractCall({
          contract,
          method: isTransfer ? "function transfer(address to, uint256 value)" : "function mintTo(address to, uint256 value)",
          params: isTransfer ? [depositAddress, toUSDC(amount)] : [account.address, toUSDC(amount)],
        })
      }
      onTransactionSent={(result) =>
        console.log("TX envoyée:", result.transactionHash)
      }
      onTransactionConfirmed={(receipt) => {
        isTransfer ? callback("TRANSFERRED") : callback(txId);
        console.log("TX confirmée:", receipt.transactionHash);
      }}
      onError={(error) => console.error("Erreur:", error)}
      payModal={false}
    >
      ✅ {buttonText}
    </TransactionButton>
  );
};
