import type { Metadata } from "next";
import PublicWarrantyDocument from "../../../components/warranty/PublicWarrantyDocument";
import { createServiceClient } from "../../../lib/supabase/admin";
import { verifyWarrantyAccessToken } from "../../../lib/warranty/public-access";
import type { Warranty } from "../../../lib/warranty/types";
import styles from "../WarrantyPage.module.css";

export const metadata: Metadata = {
  title: "품질보증서 | 포그니필름",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ token?: string; print?: string }>;
};

export default async function WarrantyDocumentPage({
  searchParams,
}: PageProps) {
  const parameters = await searchParams;
  const payload = parameters.token
    ? verifyWarrantyAccessToken(parameters.token)
    : null;
  const supabase = payload ? createServiceClient() : null;

  if (!payload || !supabase) {
    return <InvalidDocument />;
  }

  const { data, error } = await supabase
    .from("warranties")
    .select(
      "id,warranty_number,customer_name,phone,region,place,installation_date,product_name,installation_area,warranty_period,installer,notes,created_at,updated_at,created_by,updated_by",
    )
    .eq("id", payload.warrantyId)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("[warranty-document] Warranty query failed.", {
        code: error.code,
        message: error.message,
      });
    }
    return <InvalidDocument />;
  }

  return (
    <PublicWarrantyDocument
      item={data as Warranty}
      autoPrint={parameters.print === "1"}
    />
  );
}

function InvalidDocument() {
  return (
    <main className={styles.invalid}>
      <div>
        <h1>보증서를 표시할 수 없습니다.</h1>
        <p>조회 링크가 만료되었거나 유효하지 않습니다.</p>
        <a href="/warranty">품질보증서 다시 조회하기</a>
      </div>
    </main>
  );
}
