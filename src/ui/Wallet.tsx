import React, { useEffect, useMemo, useState } from "react";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { apiJson } from "../lib/api";
import { getLaunchSafe } from "../lib/tma";
import { thirdwebClient } from "../lib/thirdwebClient";

export default function Wallet() {
  const launch = useMemo(() => getLaunchSafe(), []);
  const account = useActiveAccount();
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const wallets = useMemo(
    () => [
      inAppWallet({
        auth: { options: ["email", "google"] },
      }),
    ],
    []
  );

  useEffect(() => {
    const addr = account?.address;
    if (!addr || saved) return;

    apiJson("/api/wallet", {
      method: "POST",
      body: { address: addr, telegram_user_id: launch.user?.id },
    })
      .then(() => setSaved(true))
      .catch((e) => setErr(e.message ?? "Erreur"));
  }, [account?.address, saved, launch.user?.id]);

  return (
    <div className="card">
      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        Connexion wallet (thirdweb)
      </div>
      <div className="muted">
        Connectez-vous avec un Email ou un compte Google pour créer votre
        portefeuille électronque ainsi que votre IBAN virtuel.
      </div>
      <div style={{ height: 10 }} />

      <ConnectButton client={thirdwebClient} wallets={wallets} />

      <div style={{ height: 10 }} />
      {account?.address && (
        <div className="badge">Adresse: {account.address}</div>
      )}
      {saved && (
        <div style={{ marginTop: 10 }}>
          ✅ Votre portefeuille électronique a été enregistré avec succès!
        </div>
      )}
      {err && <div style={{ marginTop: 10, color: "#ff9aa2" }}>{err}</div>}
    </div>
  );
}
