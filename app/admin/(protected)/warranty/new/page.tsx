import WarrantyForm from "../../../../../components/admin/WarrantyForm";

export default function NewWarrantyPage() {
  return (
    <>
      <div className="admin-page-heading">
        <div><p>WARRANTY</p><h1>품질보증서 등록</h1></div>
      </div>
      <WarrantyForm mode="create" />
    </>
  );
}
