type AdminMetricCardProps = {
  label: string;
  status: string;
  value?: number | null;
};

export default function AdminMetricCard({
  label,
  status,
  value,
}: AdminMetricCardProps) {
  return (
    <article className="admin-metric-card">
      <span>{label}</span>
      <strong>{value ?? "—"}</strong>
      <p>{status}</p>
    </article>
  );
}
