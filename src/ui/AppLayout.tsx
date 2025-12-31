import React, { useEffect } from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { useMe } from "../hooks/useMe";
import Start from "./Start";
import Wallet from "./Wallet";

export default function AppLayout() {
  const loc = useLocation();
  const { user, loading, err } = useMe();

  // Initialize Telegram WebApp (expand view, mark as ready)
  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;
    try {
      tg?.ready?.();
      tg?.expand?.();
    } catch {}
  }, []);

  // Loading screen
  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="title-box">
            <h1 className="title">Bienvenue sur votre assistant de transfert de fonds Saverr</h1>
          </div>
          <div className="step">Chargement…</div>
        </div>
      </div>
    );
  }

  // Error state (e.g., missing initData, backend offline)
  if (err) {
    return (
      <div className="container">
        <div className="card" style={{ color: "#ff9aa2" }}>
          Erreur: {err}
        </div>
      </div>
    );
  }

  const kyc = user?.kyc_status || "DRAFT";
  const isApproved = kyc === "APPROVED";
  const hasWallet = !!user?.user_tw_eoa;

  // Step 1: KYC verification (DRAFT / PENDING / REJECTED / APPROVED)
  if (!isApproved) {
    return (
      <div className="container">
        <div className="card">
          <div className="title-box">
            <h1 className="title">Bienvenue sur votre assistant de transfert de fonds Saverr</h1>
          </div>
          <div className="step">
            <span className="step-stage">Étape 1/2 :</span> Identification et vérifications
          </div>
        </div>
        <Start kycStatus={kyc} />
      </div>
    );
  }

  // Step 2: Wallet creation (if KYC approved but wallet missing)
  if (!hasWallet) {
    return (
      <div className="container">
        <div className="card">
          <div className="title-box">
            <h1 className="title">Bienvenue sur votre assistant de transfert de fonds Saverr</h1>
          </div>
          <div className="step">
            <span className="step-stage">Étape 2/2 :</span> Création du portefeuille électronique
          </div>
        </div>
        <Wallet />
      </div>
    );
  }

  // Onboarding complete => normal navigation (Home / Me / Transactions)
  // Automatically redirect "/" and "/wallet" to /home
  if (
    loc.pathname === "/" ||
    loc.pathname === "/wallet" ||
    loc.pathname === "/kyc"
  ) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="title-box">
              <h1 className="title">
                Bienvenue sur votre assistant de transfert de fonds Saverr
              </h1>
            </div>
            <div className="step">KYC: {kyc}</div>
          </div>
          {loc.pathname !== "/home" && (
            <Link className="btn secondary" to="/home">
              Menu
            </Link>
          )}
        </div>
      </div>

      <Outlet />
    </div>
  );
}
