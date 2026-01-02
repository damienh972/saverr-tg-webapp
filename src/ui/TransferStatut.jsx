const Statut = ({ statutValue }) => {
  const renderClasseName = (text) => {
    switch (text) {
      case "PENDING":
        return "awaiting";
      case "COMPLETED":
        return "done";
      case "IN_PROCESS":
        return "processing";
      case "REJECTED":
        return "refused";
      case "CANCELED":
        return "canceled";
      default:
        return "";
    }
  };
  const renderStatusValue = (text) => {
    switch (text) {
      case "PENDING":
        return "En attente";
      case "COMPLETED":
        return "Effectué";
      case "IN_PROCESS":
        return "En traitement";
      case "REJECTED":
        return "Refusé";
      case "CANCELED":
        return "Annulé";
      default:
        return "";
    }
  };

  return (
    <div className={renderClasseName(statutValue)}>
      <p>{renderStatusValue(statutValue)}</p>
    </div>
  );
};

export default Statut