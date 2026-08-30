import MiTimeReportRoute from "@/components/timereport/MiTimeReportRoute";

export const metadata = {
  title: "Mi Time Report · RDR",
  description:
    "Tu imputación de la quincena según el reparto de coordinación, con copia directa en el formato del TR de BBVA.",
};

// Ruta fina: la lógica vive en components/timereport/. Chrome global en AppFrame.
export default function TimeReportPage() {
  return <MiTimeReportRoute />;
}
