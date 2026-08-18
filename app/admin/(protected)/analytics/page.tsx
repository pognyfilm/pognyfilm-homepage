import AnalyticsDashboard from "../../../../components/admin/AnalyticsDashboard";

export default function AdminAnalyticsPage() {
  return <>
    <div className="admin-page-heading"><div><p>DATA INSIGHT</p><h1>광고·방문 분석</h1></div><span className="admin-status-chip">GA4 · Phase 1</span></div>
    <AnalyticsDashboard />
  </>;
}
