export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseConfigured) redirect("/");

  const { getAllUsers } = await import("@/lib/db");
  const users = await getAllUsers();
  const proUsers = users.filter((u) => u.plan === "pro").length;
  const freeUsers = users.filter((u) => u.plan === "free").length;
  const totalMessages = users.reduce((sum, u) => sum + (u.messages_total || 0), 0);
  const revenue = proUsers * 9.99;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">tataAI Admin</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: users.length, color: "from-violet-500 to-blue-500" },
            { label: "Pro Users", value: proUsers, color: "from-yellow-500 to-orange-500" },
            { label: "Free Users", value: freeUsers, color: "from-green-500 to-teal-500" },
            { label: "Est. Revenue", value: `$${revenue.toFixed(2)}`, color: "from-pink-500 to-rose-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-white/50 text-sm mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-white/50 text-sm mb-1">Total Messages Sent</p>
            <p className="text-3xl font-bold text-white">{totalMessages.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-white/50 text-sm mb-1">Conversion Rate</p>
            <p className="text-3xl font-bold text-white">
              {users.length > 0 ? ((proUsers / users.length) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="font-semibold text-white">All Users ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Name", "Email", "Plan", "Msgs Today", "Msgs Total", "Joined"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-sm text-white">{user.name || "—"}</td>
                    <td className="px-6 py-4 text-sm text-white/70">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.plan === "pro"
                            ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                            : "bg-white/10 text-white/60 border border-white/10"
                        }`}
                      >
                        {user.plan === "pro" ? "⭐ Pro" : "Free"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/70">{user.messages_today ?? 0}</td>
                    <td className="px-6 py-4 text-sm text-white/70">{user.messages_total ?? 0}</td>
                    <td className="px-6 py-4 text-sm text-white/40">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-white/30 text-sm">
                      No users yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
