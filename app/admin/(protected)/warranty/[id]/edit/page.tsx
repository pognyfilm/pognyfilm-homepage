import { notFound } from "next/navigation";
import WarrantyForm from "../../../../../../components/admin/WarrantyForm";
import { getAdminWarranty } from "../../../../../../lib/warranty/queries";
import { assertWarrantyId } from "../../../../../../lib/warranty/validation";

export default async function EditWarrantyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    assertWarrantyId(id);
  } catch {
    notFound();
  }
  const { item, error } = await getAdminWarranty(id);
  if (!item && !error) notFound();

  return (
    <>
      <div className="admin-page-heading">
        <div><p>WARRANTY</p><h1>품질보증서 수정</h1></div>
      </div>
      {item ? (
        <WarrantyForm mode="edit" initialItem={item} />
      ) : (
        <p className="admin-data-error" role="alert">{error}</p>
      )}
    </>
  );
}
