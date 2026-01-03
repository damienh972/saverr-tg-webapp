import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  ConnectButton,
  useActiveAccount,
  useSendTransaction,
  darkTheme,
} from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { sepolia } from "thirdweb/chains";
import { apiJson } from "../lib/api";
import { getLaunchSafe } from "../lib/tma";
import { thirdwebClient } from "../lib/thirdwebClient";
import { prepareTransaction } from "thirdweb";

export default function Wallet({
  onWalletCreated,
}: {
  onWalletCreated: () => void;
}) {
  const launch = useMemo(() => getLaunchSafe(), []);
  const account = useActiveAccount();
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const { mutate: sendTx } = useSendTransaction();

  const wallets = useMemo(
    () => [
      inAppWallet({
        auth: {
          options: ["email", "google"],
        },
        smartAccount: {
          sponsorGas: true,
          chain: sepolia,
        },
      }),
    ],
    []
  );

  useEffect(() => {
    const deploySmartAccount = async () => {
      if (!account?.address || saved || isDeploying) return;

      setIsDeploying(true);
      try {
        const tx = prepareTransaction({
          client: thirdwebClient,
          chain: sepolia,
          to: account.address,
          value: 0n,
        });

        await sendTx(tx);
        console.log("✅ Smart Account déployé");
      } catch (error: any) {
        console.error("Déploiement échoué:", error);
      } finally {
        setIsDeploying(false);
      }
    };

    deploySmartAccount();
  }, [account?.address, saved, isDeploying, sendTx]);

  useEffect(() => {
    const addr = account?.address;
    if (!addr || saved) return;

    apiJson("/api/wallet", {
      method: "POST",
      body: {
        address: addr,
        telegram_user_id: launch.user?.id,
      },
    })
      .then(() => {
        setSaved(true), onWalletCreated();
      })
      .catch((e) => setErr(e.message ?? "Erreur"));
  }, [account?.address, saved, launch.user?.id]);

  return (
    <div className="card">
      <h2 className="menu-title">Création de votre compte personnel</h2>
      <div className="muted">
        <p>
          Liez votre <strong>e-mail</strong> ou votre{" "}
          <strong>compte Google</strong> pour créer votre
          <strong> compte</strong> ainsi que votre <strong>IBAN virtuel</strong>
          .
        </p>
      </div>
      <div style={{ height: 10 }} />

      {!account?.address && (
        <ConnectButton
          client={thirdwebClient}
          wallets={wallets}
          locale={"fr_FR"}
          connectButton={{ label: "Je me connecte" }}
        />
      )}

      {saved && (
        <div style={{ marginTop: 10 }}>
          ✅ Votre compte a été enregistré avec succès!
        </div>
      )}
      {err && <div style={{ marginTop: 10, color: "#ff9aa2" }}>{err}</div>}
      {isDeploying && (
        <div style={{ marginTop: 10, color: "#3b82f6" }}>
          🚀 Déploiement Smart Account...
        </div>
      )}
    </div>
  );
}
