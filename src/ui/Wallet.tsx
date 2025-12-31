import React, { useEffect, useMemo, useState } from "react";
import { ConnectButton, useActiveAccount, useSendTransaction } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { sepolia } from "thirdweb/chains";
import { apiJson } from "../lib/api";
import { getLaunchSafe } from "../lib/tma";
import { thirdwebClient } from "../lib/thirdwebClient";
import { prepareTransaction } from "thirdweb";

export default function Wallet() {
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
          chain: sepolia
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
        telegram_user_id: launch.user?.id
      },
    })
      .then(() => setSaved(true))
      .catch((e) => setErr(e.message ?? "Erreur"));
  }, [account?.address, saved, launch.user?.id]);

  return (
    <div className="card">
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Connexion wallet (thirdweb)</div>
      <div className="muted">
        Connecte-toi via Email ou Google pour créer ton wallet et ton IBAN virtuel.
      </div>
      <div style={{ height: 10 }} />

      <ConnectButton client={thirdwebClient} wallets={wallets} />

      <div style={{ height: 10 }} />
      {account?.address && <div className="badge">Adresse: {account.address}</div>}
      {saved && <div style={{ marginTop: 10 }}>✅ Wallet enregistré !</div>}
      {err && <div style={{ marginTop: 10, color: "#ff9aa2" }}>{err}</div>}
      {isDeploying && <div style={{ marginTop: 10, color: "#3b82f6" }}>🚀 Déploiement Smart Account...</div>}
    </div>
  );
}
