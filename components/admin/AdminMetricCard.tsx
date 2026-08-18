import Link from "next/link";

type AdminMetricCardProps = {
  label: string;
  status: string;
  value?: number | string | null;
  href?: string;
};

export default function AdminMetricCard({
  label,
  status,
  value,
  href,
}: AdminMetricCardProps) {
  const content = (
    <>
      <span>{label}</span>
      <strong>{value ?? "—"}</strong>
      <p>{status}</p>
    </>
  );
  return href ? <Link className="admin-metric-card admin-metric-link" href={href}>{content}</Link> : <article className="admin-metric-card">{content}</article>;
}
