import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="card">
      <h2 className="menu-title">Menu</h2>
      <div className="row">
        <div className="link-block">
          <Link className="btn-menu" to="/me">
            <p className="menu-text">Mes informations</p>
            <img src="../assets/images/right-arrow.jpg" alt="Flèche" />
          </Link>
        </div>

        <div className="link-block">
          <Link className="btn-menu" to="/transactions">
            <p className="menu-text">Historique de mes transferts</p>
            <img src="../assets/images/right-arrow.jpg" alt="Flèche" />
          </Link>
        </div>

        <Link className="btn-transfer" to="/new-transaction">
          Je fais un nouveau transfert{" "}
        </Link>
      </div>
    </div>
  );
}
