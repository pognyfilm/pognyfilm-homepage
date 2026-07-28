import PortfolioForm from "../../../../../components/admin/PortfolioForm";

export default function NewPortfolioPage() {
  return (
    <>
      <div className="admin-page-heading">
        <div><p>PORTFOLIO</p><h1>포트폴리오 등록</h1></div>
      </div>
      <PortfolioForm mode="create" portfolioId={crypto.randomUUID()} />
    </>
  );
}
