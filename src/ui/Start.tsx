import React, { useState } from "react";
import { apiJson } from "../lib/api";
import { getLaunchSafe, requestContactSafe } from "../lib/tma";

type Props = { kycStatus: string };
type OnboardingResp = { onboardingUrl: string };

export default function Start({ kycStatus }: Props) {
  const launch = getLaunchSafe();
  const [phone, setPhone] = useState<string | null>(null);
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const sharePhone = async () => {
    setErr(null);
    setLoading(true);
    try {
      const c = await requestContactSafe();
      const tel = `${ c?.contact?.phone_number }`;
      if (!tel) throw new Error("Téléphone non partagé.");
      setPhone(tel);

      const resp = await apiJson<OnboardingResp>("/api/onboarding", {
        method: "POST",
        body: {
          telegram_user_id: launch.user?.id,
          phone_number: tel,
        },
      });

      setOnboardingUrl(resp.onboardingUrl);
    } catch (e: any) {
      setErr(e.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Statut KYC</div>

        {/* NOT_STARTED */}
        {kycStatus === "NOT_STARTED" && (
          <>
            <div className="muted">
              Merci de partager votre numéro afin de démarrer votre vérification KYC.
            </div>
            <div style={{ height: 10 }} />
            <button className="btn" onClick={sharePhone} disabled={loading}>
              {loading ? "En cours…" : "Partager mon numéro"}
            </button>
            {phone && (
              <div style={{ marginTop: 10 }}>
                <span className="badge">Téléphone: {phone}</span>
              </div>
            )}
            {err && <div style={{ marginTop: 10, color: "#ff9aa2" }}>{err}</div>}
          </>
        )}

        {/* SUBMITTED */}
        {kycStatus === "SUBMITTED" && (
          <div>Merci, votre KYC a été soumis. Validation en cours…</div>
        )}

        {/* REJECTED */}
        {kycStatus === "REJECTED" && (
          <div style={{ color: "#ff9aa2" }}>
            KYC refusé. Veuillez contacter le support Saverr.
          </div>
        )}

        {/* APPROVED (should not reach here as AppLayout redirects to Wallet) */}
        {kycStatus === "APPROVED" && (
          <div>KYC approuvé ! Préparation de l'étape suivante…</div>
        )}
      </div>

      {/* Onboarding link (only shown if NOT_STARTED and URL obtained) */}
      {onboardingUrl && kycStatus === "NOT_STARTED" && (
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Lien KYC</div>
          <a className="btn" href={onboardingUrl} target="_blank" rel="noreferrer">
            Démarrer ma KYC
          </a>
        </div>
      )}
    </>
  );
}
