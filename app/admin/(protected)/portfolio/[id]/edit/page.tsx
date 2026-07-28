import { notFound } from "next/navigation";
import PortfolioForm from "../../../../../../components/admin/PortfolioForm";
import { getAdminPortfolioItem } from "../../../../../../lib/portfolio/queries";

export default async function EditPortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { item, error } = await getAdminPortfolioItem(id);
  if (!item && !error) notFound();

  return (
    <>
      <div className="admin-page-heading">
        <div><p>PORTFOLIO</p><h1>포트폴리오 수정</h1></div>
      </div>
      {item ? (
        <PortfolioForm mode="edit" portfolioId={id} initialItem={item} />
      ) : (
        <p className="admin-data-error" role="alert">{error}</p>
      )}
    </>
  );
}
