import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="card">
      <div style={{ fontWeight: 700, marginBottom: 10 }}>Menu</div>
      <div className="row">
        <Link className="btn" to="/me">
          Mes informations
        </Link>
        <Link className="btn" to="/transactions">
          Historique de mes transferts
        </Link>
        <Link className="btn" to="/new-transaction">
          Nouveau transfert
        </Link>
      </div>
    </div>
  );
}
