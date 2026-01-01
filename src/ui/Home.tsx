import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="card">
      <div style={{ fontWeight: 700, marginBottom: 10 }}>Menu</div>
      <div className="row">
        <Link className="btn-menu" to="/me">
          Mes informations{" "}
          <img src="../assets/images/right-arrow.jpg" alt="Flèche" />
        </Link>
        <Link className="btn-menu" to="/transactions">
          Historique de mes transferts{" "}
          <img src="../assets/images/right-arrow.jpg" alt="Flèche" />
        </Link>
        <Link className="btn transfer" to="/new-transaction">
          Je fais un nouveau transfert{" "}
        </Link>
      </div>
    </div>
  );
}
