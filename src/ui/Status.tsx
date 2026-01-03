import React from 'react' ;

const Status = ({ statusValue }: {statusValue: string}) => {
  const renderClasseName = (text?: string) => {
    switch (text) {
      case "CREATED":
        return "created label";
      case "PROCESSING":
        return "processing label";
      case "DEPOSITED":
        return "deposited label";
      case "TRANSFERRED":
        return "transferred label";
      case "COMPLETED":
        return "completed label";
      case "CANCELLED":
        return "cancelled label";
      case "FAILED":
        return "failed label";
      default:
        return "label";
    }
  };
  const renderStatusValue = (text?: string) => {
    switch (text) {
      case "CREATED":
        return "En attente de validation";
      case "PROCESSING":
        return "En attente de dépôt";
      case "DEPOSITED":
        return "Dépot effectué";
      case "TRANSFERRED":
        return "Transfert effectué";
      case "COMPLETED":
        return "Terminé";
      case "CANCELLED":
        return "Annulé";
      case "FAILED":
        return "Échec";
      default:
        return "";
    }
  };
  return (
    <div className={renderClasseName(statusValue)}>
      <p className='status-value'>{renderStatusValue(statusValue)}</p>
    </div>
  )
}

export default Status