type AdminEmptyStateProps = {
  title: string;
  message: string;
  detail: string;
};

export default function AdminEmptyState({
  title,
  message,
  detail,
}: AdminEmptyStateProps) {
  return (
    <article className="admin-empty-card">
      <div className="admin-card-title">
        <h2>{title}</h2>
        <span>준비 중</span>
      </div>
      <div className="admin-empty-content">
        <span aria-hidden="true">+</span>
        <strong>{message}</strong>
        <p>{detail}</p>
      </div>
    </article>
  );
}
