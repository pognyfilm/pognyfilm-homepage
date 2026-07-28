import { notFound } from "next/navigation";
import WarrantyPrintDocument from "../../../../../../components/admin/WarrantyPrintDocument";
import { getAdminWarranty } from "../../../../../../lib/warranty/queries";
import { assertWarrantyId } from "../../../../../../lib/warranty/validation";

export default async function PrintWarrantyPage({
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

  const { item } = await getAdminWarranty(id);
  if (!item) notFound();

  return <WarrantyPrintDocument item={item} />;
}
