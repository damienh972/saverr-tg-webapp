import React, { useEffect, useState } from "react";
import { apiJson } from "../lib/api";
import { Link } from "react-router-dom";

type MeResp = {
  user: {
    kyc_status: "APPROVED" | "REJECTED" | "PENDING";
    noah_virtual_iban: string;
    phone: string;
  } | null;
};

export default function Me() {
  const [data, setData] = useState<MeResp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiJson<MeResp>("/api/me")
      .then(setData)
      .catch((e) => setErr(e.message ?? "Erreur"));
  }, []);

  const getKycStatusStyle = (status: string) => {
    switch (status) {
      case "APPROVED":
        return { background: "#d4edda", color: "#155724" };
      case "REJECTED":
        return { background: "#f8d7da", color: "#721c24" };
      case "PENDING":
        return { background: "#fff3cd", color: "#856404" };
      default:
        return { background: "#e2e3e5", color: "#383d41" };
    }
  };

  const getKycStatusLabel = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "Approuvé";
      case "REJECTED":
        return "Rejeté";
      case "PENDING":
        return "En attente";
      default:
        return status;
    }
  };

  return (
    <div className="card">
      <Link className="btn-menu" to="/home">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#0077ff"><path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" /></svg>
      </Link>
      <h2 className="menu-title">Mes informations</h2>
      {err && <div style={{ color: "#ff9aa2" }}>{err}</div>}
      {!data && !err && <div className="muted">Chargement…</div>}
      {data?.user && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <div className="subtitle" style={{ marginBottom: "8px", fontSize: "14px" }}>
              Statut KYC
            </div>
            <div
              className="badge"
              style={{
                ...getKycStatusStyle(data.user.kyc_status),
                fontFamily: "PoppinsMedium",
                fontSize: "14px",
              }}
            >
              {getKycStatusLabel(data.user.kyc_status)}
            </div>
          </div>

          <hr />

          <div>
            <div className="subtitle" style={{ marginBottom: "8px", fontSize: "14px" }}>
              IBAN
            </div>
            <div
              className="menu-text"
              style={{ color: "#1b2224", fontFamily: "Roboto", fontSize: "16px" }}
            >
              {data.user.noah_virtual_iban}
            </div>
          </div>

          <hr />

          <div>
            <div className="subtitle" style={{ marginBottom: "8px", fontSize: "14px" }}>
              Numéro de téléphone
            </div>
            <div
              className="menu-text"
              style={{ color: "#1b2224", fontFamily: "Roboto", fontSize: "16px" }}
            >
              +{data.user.phone}
            </div>
          </div>
        </div>
      )}
      {data?.user === null && (
        <div className="muted">Vous n'avez pas encore de compte</div>
      )}
    </div>
  );
}
