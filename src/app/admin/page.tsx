"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Crown, TrendingUp, ArrowLeft,
  Shield, Eye, EyeOff, RefreshCw, LogOut, Zap, DollarSign,
  Radio, BarChart2, Calendar,
} from "lucide-react";

interface UserRow {
  uid: string;
  email: string;
  name: string;
  provider: string;
  plan: "free" | "pro";
  createdAt: string;
  lastLogin: string;
  disabled: boolean;
}

interface Stats {
  users: UserRow[];
  proCount: number;
  total: number;
  payments: { uid: string; orderId: string }[];
}

interface LiveStats {
  online: number;
  today: number;
  pageviews: number;
  days: { date: string; visitors: number; pageviews: number }[];
  configured: boolean;
}

const PROVIDER_LABEL: Record<string, string> = {
  "google.com": "Google",
  "github.com": "GitHub",
  "password": "Email",
  "phone": "Phone",
};

export default function AdminPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState("");
  const [live, setLive] = useState<LiveStats | null>(null);
  const liveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchLive() {
    try {
      const res = await fetch("/api/analytics/ping");
      if (res.ok) setLive(await res.json());
    } catch {}
  }

  useEffect(() => {
    if (!stats) return;
    fetchLive();
    liveRef.current = setInterval(fetchLive, 15_000); // refresh every 15s
    return () => { if (liveRef.current) clearInterval(liveRef.current); };
  }, [stats]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) { setError("Wrong password"); return; }
      const data = await res.json();
      setStats(data);
    } catch {
      setError("Failed to connect");
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) setStats(await res.json());
    } finally {
      setLoading(false);
    }
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">tatAI Admin</span>
          </div>

          <form onSubmit={handleLogin} className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-7 space-y-4">
            <div>
              <label className="block text-white/50 text-xs font-medium mb-2 uppercase tracking-wider">Admin Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secret password"
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-violet-500/60 pr-11"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {loading ? "Verifying…" : "Enter Dashboard"}
            </button>
          </form>

          <button onClick={() => router.push("/")} className="mt-4 w-full text-center text-white/25 hover:text-white/50 text-xs transition-colors">
            ← Back to tatAI
          </button>
        </div>
      </div>
    );
  }

  const freeCount = stats.total - stats.proCount;
  const revenue = stats.proCount * 9.99;
  const conversionRate = stats.total > 0 ? ((stats.proCount / stats.total) * 100).toFixed(1) : "0";

  const filtered = stats.users.filter((u) =>
    !search || u.email.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#0a0a0a]/90 backdrop-blur">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="text-white/30 hover:text-white/70 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">tatAI Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/50 hover:text-white/80 text-xs transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setStats(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/50 hover:text-red-400 text-xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Live Visitor Stats */}
        {live && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Online now */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/40 text-xs font-medium">Online Now</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-[10px] font-medium">LIVE</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-green-400">{live.online}</p>
              <p className="text-white/25 text-xs mt-1">active in last 90s</p>
              {!live.configured && (
                <p className="text-yellow-400/60 text-[10px] mt-2">⚠ Configure Upstash Redis to enable</p>
              )}
            </div>

            {/* Today's visitors */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/40 text-xs font-medium">Today&apos;s Visitors</p>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">{live.today}</p>
              <p className="text-white/25 text-xs mt-1">unique sessions today</p>
            </div>

            {/* Today's page views */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/40 text-xs font-medium">Page Views Today</p>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <BarChart2 className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">{live.pageviews ?? 0}</p>
              <p className="text-white/25 text-xs mt-1">total pings today</p>
            </div>
          </div>
        )}

        {/* 7-Day Chart */}
        {live?.days && live.days.length > 0 && (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Radio className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-semibold text-white">Last 7 Days</h2>
              <span className="text-white/25 text-xs ml-auto">auto-refreshes every 15s</span>
            </div>
            <div className="flex items-end gap-2 h-24">
              {live.days.map((d) => {
                const maxV = Math.max(...live.days.map((x) => x.visitors), 1);
                const pct = Math.round((d.visitors / maxV) * 100);
                const label = new Date(d.date + "T00:00:00").toLocaleDateString("en", { weekday: "short" });
                const isToday = d.date === new Date().toISOString().slice(0, 10);
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${d.visitors} visitors`}>
                    <span className="text-white/40 text-[10px]">{d.visitors}</span>
                    <div className="w-full rounded-t-md transition-all duration-500"
                      style={{
                        height: `${Math.max(pct, 4)}%`,
                        background: isToday
                          ? "linear-gradient(to top, #38bdf8, #818cf8)"
                          : "rgba(255,255,255,0.08)",
                      }}
                    />
                    <span className={`text-[10px] font-medium ${isToday ? "text-sky-400" : "text-white/30"}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Users", value: stats.total, icon: Users, color: "from-violet-500 to-indigo-500", glow: "shadow-violet-500/20" },
            { label: "Pro Users", value: stats.proCount, icon: Crown, color: "from-yellow-500 to-orange-500", glow: "shadow-yellow-500/20" },
            { label: "Free Users", value: freeCount, icon: Zap, color: "from-green-500 to-teal-500", glow: "shadow-green-500/20" },
            { label: "Est. Revenue", value: `$${revenue.toFixed(2)}`, icon: DollarSign, color: "from-pink-500 to-rose-500", glow: "shadow-pink-500/20" },
          ].map((s) => (
            <div key={s.label} className={`bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 shadow-lg ${s.glow}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/40 text-xs font-medium">{s.label}</p>
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <p className={`text-3xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <p className="text-white/40 text-xs font-medium">Conversion Rate</p>
            </div>
            <p className="text-3xl font-bold text-white">{conversionRate}%</p>
            <p className="text-white/25 text-xs mt-1">Free → Pro</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-4 h-4 text-blue-400" />
              <p className="text-white/40 text-xs font-medium">Payments Recorded</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.payments.length}</p>
            <p className="text-white/25 text-xs mt-1">PayPal orders captured</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between gap-4">
            <h2 className="font-semibold text-white text-sm">All Users <span className="text-white/30 font-normal">({stats.total})</span></h2>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-1.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 w-52"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["Name", "Email", "Provider", "Plan", "Joined", "Last Login"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-medium text-white/30 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((u) => (
                  <tr key={u.uid} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-5 py-3.5 text-sm text-white font-medium">{u.name || <span className="text-white/25">—</span>}</td>
                    <td className="px-5 py-3.5 text-sm text-white/60">{u.email || <span className="text-white/25">—</span>}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-white/40 bg-white/[0.06] px-2 py-0.5 rounded-full">
                        {PROVIDER_LABEL[u.provider] ?? u.provider}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.plan === "pro"
                          ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                          : "bg-white/[0.06] text-white/40 border border-white/[0.08]"
                      }`}>
                        {u.plan === "pro" ? <><Crown className="w-3 h-3" /> Pro</> : "Free"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-white/30">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-white/30">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-white/25 text-sm">
                      {search ? "No users match your search" : "No users yet"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payments Table */}
        {stats.payments.length > 0 && (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h2 className="font-semibold text-white text-sm">PayPal Payments <span className="text-white/30 font-normal">({stats.payments.length})</span></h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {["User ID", "PayPal Order ID"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-medium text-white/30 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {stats.payments.map((p) => (
                    <tr key={p.orderId} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-5 py-3.5 text-xs text-white/50 font-mono">{p.uid}</td>
                      <td className="px-5 py-3.5 text-xs text-white/50 font-mono">{p.orderId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
