"use client";

import { useEffect, useMemo, useState } from "react";

type Row = { dimensions: Record<string, string>; metrics: Record<string, number>; conversions: number; conversionRate: number };
type Overview = {
  source: "GA4";
  current: { users: number; sessions: number; newUsers: number; leads: number };
  changes: { users: number | null; sessions: number | null; newUsers: number | null; leads: number | null };
  leadEventNames: string[];
};
type AcquisitionChannel = {
  channel: string;
  users: number;
  sessions: number;
  sessionShare: number;
  details: Array<{ source: string; medium: string; sessions: number; users: number }>;
};
type Acquisition = { basis: "session"; totalUsers: number; totalSessions: number; attributedSessions: number; channels: AcquisitionChannel[] };
type Traffic = { trend: Row[]; channels: Row[]; sources: Row[]; pages: Row[]; devices: Row[]; regions: Row[]; acquisition: Acquisition };
type Conversions = { conversions: number; events: Array<{ eventName: string; eventCount: number }> };
type AdsCampaign = { id: string; name: string; status: string; channelType: string; cost: number; impressions: number; clicks: number; ctr: number; averageCpc: number; conversions: number };
type Ads = {
  source: "Google Ads";
  currencyCode: "KRW";
  timeZone: string;
  summary: { cost: number; impressions: number; clicks: number; ctr: number; averageCpc: number; conversions: number };
  campaigns: AdsCampaign[];
};
type ApiResult<T> = { ok: true; data: T } | { ok: false; code: string; message: string };
type Preset = "today" | "yesterday" | "7d" | "30d" | "custom";

const iso = (date: Date) => date.toISOString().slice(0, 10);
const kstToday = () => {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return new Date(`${parts}T00:00:00Z`);
};
const rangeFor = (preset: Preset) => {
  const end = kstToday();
  if (preset === "yesterday") end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  if (preset === "7d") start.setUTCDate(start.getUTCDate() - 6);
  if (preset === "30d") start.setUTCDate(start.getUTCDate() - 29);
  return { startDate: iso(start), endDate: iso(end) };
};
const number = (value: number) => new Intl.NumberFormat("ko-KR").format(Math.round(value));
const percent = (value: number) => `${value.toFixed(1)}%`;
const ratioPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
const currency = (value: number) => new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(value);
const changeText = (value: number | null) => value === null ? "비교 불가" : `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

function DataTable({ title, columns, rows }: { title: string; columns: Array<{ label: string; value: (row: Row) => string }>; rows: Row[] }) {
  return (
    <section className="admin-analytics-table-card">
      <div className="admin-analytics-section-head"><h2>{title}</h2><span>{rows.length}개 항목</span></div>
      {rows.length ? (
        <div className="admin-analytics-table-wrap">
          <table><thead><tr>{columns.map((column) => <th key={column.label}>{column.label}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => <tr key={`${Object.values(row.dimensions).join("-")}-${index}`}>{columns.map((column) => <td key={column.label}>{column.value(row)}</td>)}</tr>)}</tbody></table>
        </div>
      ) : <div className="admin-analytics-empty">선택한 기간에 표시할 데이터가 없습니다.</div>}
    </section>
  );
}

function AcquisitionTable({ data }: { data: Acquisition }) {
  return (
    <section className="admin-analytics-table-card admin-acquisition-table">
      <div className="admin-analytics-section-head">
        <div><h2>유입경로 분석</h2><p>GA4 세션 유입 기준 · 전체 {number(data.totalSessions)}회 · 채널 집계 {number(data.attributedSessions)}회</p></div>
        <span>{data.channels.length}개 채널</span>
      </div>
      <div className="admin-analytics-table-wrap">
        <table>
          <thead><tr><th>채널</th><th>사용자</th><th>세션</th><th>세션 비중</th><th>source / medium</th></tr></thead>
          <tbody>
            {data.channels.map((channel) => (
              <tr key={channel.channel}>
                <td>{channel.channel}</td>
                <td>{number(channel.users)}</td>
                <td>{number(channel.sessions)}</td>
                <td>{percent(channel.sessionShare)}</td>
                <td className="admin-acquisition-details">
                  {channel.details.length
                    ? channel.details.map((detail) => `${detail.source} / ${detail.medium} · ${number(detail.sessions)}`).join(" · ")
                    : "해당 기간 유입 없음"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="admin-acquisition-note">세션 비중은 source / medium 채널 집계 합계를 기준으로 계산합니다. GA4 모델링 및 식별 불가 데이터로 전체 세션과 채널 합계가 다를 수 있습니다. 사용자는 채널 간 중복될 수 있으며, Google Ads 비용·클릭과 GA4 세션은 서로 다른 지표입니다.</p>
    </section>
  );
}

function TrendChart({ rows }: { rows: Row[] }) {
  const sorted = [...rows].sort((a, b) => (a.dimensions.date || "").localeCompare(b.dimensions.date || ""));
  const max = Math.max(1, ...sorted.flatMap((row) => [row.metrics.activeUsers || 0, row.metrics.sessions || 0, row.conversions || 0]));
  const points = (getter: (row: Row) => number) => sorted.map((row, index) => `${sorted.length === 1 ? 50 : (index / (sorted.length - 1)) * 100},${92 - (getter(row) / max) * 82}`).join(" ");
  return (
    <section className="admin-analytics-chart-card">
      <div className="admin-analytics-section-head"><h2>방문 추이</h2><div className="admin-chart-legend"><span className="is-users">사용자</span><span className="is-sessions">세션</span><span className="is-leads">문의 전환</span></div></div>
      {sorted.length ? <div className="admin-line-chart"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="일자별 방문 추이"><polyline className="is-users" points={points((row) => row.metrics.activeUsers || 0)} /><polyline className="is-sessions" points={points((row) => row.metrics.sessions || 0)} /><polyline className="is-leads" points={points((row) => row.conversions || 0)} /></svg><div className="admin-chart-axis"><span>{sorted[0]?.dimensions.date}</span><span>{sorted.at(-1)?.dimensions.date}</span></div></div> : <div className="admin-analytics-empty">선택한 기간에 표시할 데이터가 없습니다.</div>}
    </section>
  );
}

function ConversionTable({ data }: { data: Conversions }) {
  return (
    <section className="admin-analytics-table-card">
      <div className="admin-analytics-section-head"><h2>리드 이벤트</h2><span>합계 {number(data.conversions)}건</span></div>
      <div className="admin-analytics-table-wrap">
        <table><thead><tr><th>이벤트</th><th>집계</th></tr></thead>
          <tbody>{data.events.map((event) => <tr key={event.eventName}><td>{event.eventName}</td><td>{number(event.eventCount)}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

function AdsCampaignTable({ data }: { data: Ads }) {
  return (
    <section className="admin-analytics-table-card">
      <div className="admin-analytics-section-head"><h2>캠페인별 Google Ads 실적</h2><span>{data.campaigns.length}개 캠페인 · {data.timeZone}</span></div>
      {data.campaigns.length ? <div className="admin-analytics-table-wrap">
        <table><thead><tr><th>캠페인</th><th>상태</th><th>비용</th><th>노출</th><th>클릭</th><th>CTR</th><th>평균 CPC</th><th>전환</th></tr></thead>
          <tbody>{data.campaigns.map((campaign) => <tr key={campaign.id}><td>{campaign.name}<br /><small>{campaign.channelType}</small></td><td>{campaign.status}</td><td>{currency(campaign.cost)}</td><td>{number(campaign.impressions)}</td><td>{number(campaign.clicks)}</td><td>{ratioPercent(campaign.ctr)}</td><td>{currency(campaign.averageCpc)}</td><td>{number(campaign.conversions)}</td></tr>)}</tbody>
        </table>
      </div> : <div className="admin-analytics-empty">선택한 기간에 표시할 Google Ads 캠페인 데이터가 없습니다.</div>}
    </section>
  );
}

export default function AnalyticsDashboard() {
  const initial = rangeFor("7d");
  const [preset, setPreset] = useState<Preset>("7d");
  const [range, setRange] = useState(initial);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [traffic, setTraffic] = useState<Traffic | null>(null);
  const [conversions, setConversions] = useState<Conversions | null>(null);
  const [ads, setAds] = useState<Ads | null>(null);
  const [adsError, setAdsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true); setError(null); setAdsError(null);
    const query = new URLSearchParams(range).toString();
    Promise.all([
      fetch(`/api/admin/analytics/overview?${query}`, { signal: controller.signal }).then((response) => response.json() as Promise<ApiResult<Overview>>),
      fetch(`/api/admin/analytics/traffic?${query}`, { signal: controller.signal }).then((response) => response.json() as Promise<ApiResult<Traffic>>),
      fetch(`/api/admin/analytics/conversions?${query}`, { signal: controller.signal }).then((response) => response.json() as Promise<ApiResult<Conversions>>),
      fetch(`/api/admin/analytics/ads?${query}`, { signal: controller.signal }).then((response) => response.json() as Promise<ApiResult<Ads>>),
    ]).then(([overviewResult, trafficResult, conversionsResult, adsResult]) => {
      if (!active) return;
      if (!overviewResult.ok) throw new Error(overviewResult.message);
      if (!trafficResult.ok) throw new Error(trafficResult.message);
      if (!conversionsResult.ok) throw new Error(conversionsResult.message);
      setOverview(overviewResult.data); setTraffic(trafficResult.data); setConversions(conversionsResult.data);
      if (adsResult.ok) setAds(adsResult.data);
      else { setAds(null); setAdsError(adsResult.message); }
    }).catch((reason) => { if (active && reason?.name !== "AbortError") { setOverview(null); setTraffic(null); setConversions(null); setAds(null); setError(reason instanceof Error ? reason.message : "분석 데이터를 불러오지 못했습니다."); } }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [range]);

  const kpis = useMemo(() => overview ? [
    ["사용자", overview.current.users, overview.changes.users], ["세션", overview.current.sessions, overview.changes.sessions], ["신규 사용자", overview.current.newUsers, overview.changes.newUsers], ["문의 전환", overview.current.leads, overview.changes.leads],
  ] as const : [], [overview]);

  const choosePreset = (value: Preset) => { setPreset(value); if (value !== "custom") setRange(rangeFor(value)); };
  return (
    <div className="admin-analytics-page">
      <div className="admin-analytics-controls" aria-label="분석 기간 선택">
        {(["today", "yesterday", "7d", "30d", "custom"] as Preset[]).map((value) => <button className={preset === value ? "is-active" : ""} type="button" onClick={() => choosePreset(value)} key={value}>{({ today: "오늘", yesterday: "어제", "7d": "최근 7일", "30d": "최근 30일", custom: "직접 설정" })[value]}</button>)}
        {preset === "custom" && <div className="admin-date-inputs"><input aria-label="시작일" type="date" value={range.startDate} onChange={(event) => setRange((current) => ({ ...current, startDate: event.target.value }))} /><span>–</span><input aria-label="종료일" type="date" value={range.endDate} onChange={(event) => setRange((current) => ({ ...current, endDate: event.target.value }))} /></div>}
      </div>

      {loading && <div className="admin-analytics-loading" role="status">GA4 데이터를 불러오는 중입니다.</div>}
      {error && <section className="admin-analytics-connection" role="status"><strong>Google Analytics 연결이 필요합니다.</strong><p>{error}</p><a href="#analytics-setup">설정 방법 확인</a></section>}
      {!loading && !error && overview && traffic && conversions && <>
        <section className="admin-analytics-kpis" aria-label="방문 핵심 지표">
          {kpis.map(([label, value, change]) => <article key={label}><span>{label}</span><strong>{number(value)}</strong><p className={change !== null && change > 0 ? "is-up" : change !== null && change < 0 ? "is-down" : ""}>{changeText(change)} <em>GA4</em></p></article>)}
          {ads ? <>
            <article><span>광고비</span><strong>{currency(ads.summary.cost)}</strong><p>{ads.currencyCode} <em>Google Ads</em></p></article>
            <article><span>광고 노출</span><strong>{number(ads.summary.impressions)}</strong><p>impressions <em>Google Ads</em></p></article>
            <article><span>광고 클릭</span><strong>{number(ads.summary.clicks)}</strong><p>clicks <em>Google Ads</em></p></article>
            <article><span>CTR</span><strong>{ratioPercent(ads.summary.ctr)}</strong><p>click-through rate <em>Google Ads</em></p></article>
            <article><span>평균 CPC</span><strong>{currency(ads.summary.averageCpc)}</strong><p>average CPC <em>Google Ads</em></p></article>
            <article><span>광고 전환</span><strong>{number(ads.summary.conversions)}</strong><p>conversions <em>Google Ads</em></p></article>
          </> : ["광고비", "광고 노출", "광고 클릭", "CTR", "평균 CPC", "광고 전환"].map((label) => <article className="is-pending" key={label}><span>{label}</span><strong>—</strong><p>{adsError || "Google Ads 조회 중"} <em>Google Ads</em></p></article>)}
        </section>
        <TrendChart rows={traffic.trend} />
        <AcquisitionTable data={traffic.acquisition} />
        <div className="admin-analytics-grid">
          <DataTable title="유입 채널" rows={traffic.channels} columns={[{ label: "채널", value: (r) => r.dimensions.sessionDefaultChannelGroup || "기타" }, { label: "사용자", value: (r) => number(r.metrics.activeUsers || 0) }, { label: "세션", value: (r) => number(r.metrics.sessions || 0) }, { label: "참여 세션", value: (r) => number(r.metrics.engagedSessions || 0) }, { label: "문의 전환", value: (r) => number(r.conversions) }, { label: "전환율", value: (r) => percent(r.conversionRate) }]} />
          <DataTable title="기기" rows={traffic.devices} columns={[{ label: "기기", value: (r) => r.dimensions.deviceCategory }, { label: "사용자", value: (r) => number(r.metrics.activeUsers || 0) }, { label: "세션", value: (r) => number(r.metrics.sessions || 0) }, { label: "문의 전환", value: (r) => number(r.conversions) }, { label: "전환율", value: (r) => percent(r.conversionRate) }]} />
        </div>
        <DataTable title="유입 소스 / 매체" rows={traffic.sources} columns={[{ label: "소스 / 매체", value: (r) => `${r.dimensions.sessionSource || "direct"} / ${r.dimensions.sessionMedium || "none"}` }, { label: "세션", value: (r) => number(r.metrics.sessions || 0) }, { label: "사용자", value: (r) => number(r.metrics.activeUsers || 0) }, { label: "문의 전환", value: (r) => number(r.conversions) }, { label: "전환율", value: (r) => percent(r.conversionRate) }]} />
        <DataTable title="인기 페이지" rows={traffic.pages} columns={[{ label: "페이지", value: (r) => `${r.dimensions.pageTitle || "제목 없음"} · ${r.dimensions.pagePath}` }, { label: "조회수", value: (r) => number(r.metrics.screenPageViews || 0) }, { label: "사용자", value: (r) => number(r.metrics.activeUsers || 0) }, { label: "평균 참여시간", value: (r) => `${Math.round(r.metrics.averageSessionDuration || 0)}초` }, { label: "문의 전환", value: (r) => number(r.conversions) }]} />
        <DataTable title="지역" rows={traffic.regions} columns={[{ label: "지역", value: (r) => [r.dimensions.region, r.dimensions.city].filter(Boolean).join(" · ") || "알 수 없음" }, { label: "사용자", value: (r) => number(r.metrics.activeUsers || 0) }, { label: "세션", value: (r) => number(r.metrics.sessions || 0) }, { label: "문의 전환", value: (r) => number(r.conversions) }]} />
        <ConversionTable data={conversions} />
        {adsError && <section className="admin-analytics-connection" role="status"><strong>Google Ads 데이터를 불러오지 못했습니다.</strong><p>{adsError}</p></section>}
        {ads && <AdsCampaignTable data={ads} />}
      </>}
      <section className="admin-analytics-roadmap" id="analytics-setup"><h2>연결 및 다음 단계</h2><div><article><span>Phase 1</span><strong>GA4 방문 분석</strong><p>서비스 계정 읽기 권한으로 실제 방문 데이터를 조회합니다.</p></article><article><span>Phase 2</span><strong>Google Ads 읽기 전용 분석</strong><p>광고계정 시간대 기준으로 비용·노출·클릭·전환과 캠페인 실적을 조회합니다.</p></article><article><span>Phase 3</span><strong>문의 기여 분석</strong><p>UTM·GCLID 구조와 CSV·고급 필터를 별도 migration 제안 후 연결합니다.</p></article></div></section>
    </div>
  );
}
