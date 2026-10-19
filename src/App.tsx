import { useState } from "react";
import {
  Activity,
  Server,
  TriangleAlert,
  ShieldCheck,
  BrainCircuit,
  LayoutDashboard,
  Bell,
  Search,
} from "lucide-react";
import LogAnalyzer from "./components/LogAnalyzer";

type Page = "Dashboard" | "Servidores" | "Incidentes" | "Análise IA";

const servers = [
  { name: "SRV-VMWARE-01", ip: "192.168.10.10", status: "Online", cpu: "32%" },
  { name: "SRV-LINUX-02", ip: "192.168.10.11", status: "Online", cpu: "48%" },
  { name: "STORAGE-HPE-01", ip: "192.168.10.20", status: "Warning", cpu: "67%" },
  { name: "SRV-ORACLE-03", ip: "192.168.10.30", status: "Offline", cpu: "—" },
];

const incidents = [
  { id: "INC-1042", equipment: "SRV-ORACLE-03", issue: "Servidor indisponível", severity: "Crítico" },
  { id: "INC-1043", equipment: "STORAGE-HPE-01", issue: "Falha preditiva de disco", severity: "Alto" },
  { id: "INC-1044", equipment: "SRV-LINUX-02", issue: "Utilização de memória elevada", severity: "Médio" },
];

function App() {
  const [page, setPage] = useState<Page>("Dashboard");
  const [search, setSearch] = useState("");

  const filteredServers = servers.filter((server) =>
    `${server.name} ${server.ip} ${server.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const menu: { label: Page; icon: typeof Activity }[] = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Servidores", icon: Server },
    { label: "Incidentes", icon: TriangleAlert },
    { label: "Análise IA", icon: BrainCircuit },
  ];

  return (
    <div className="min-h-screen bg-[#081426] text-slate-100 md:flex">
      <aside className="w-full border-b border-slate-800 bg-[#0d1c32] p-6 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-cyan-400">GSC AI</h1>
          <p className="text-sm text-slate-400">Log Analyzer · NOC</p>
        </div>

        <nav className="flex flex-wrap gap-2 md:flex-col">
          {menu.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setPage(label)}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left transition ${
                page === label
                  ? "bg-cyan-500/15 text-cyan-400"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Icon size={19} />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-12 rounded-lg border border-amber-700/40 bg-amber-950/30 p-3 text-xs text-amber-200">
          Ambiente demonstrativo. Nenhum servidor real está conectado.
        </div>
      </aside>

      <main className="flex-1 p-5 md:p-10">
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-sm text-cyan-400">Olga Tecnologia</p>
            <h2 className="text-3xl font-bold">{page}</h2>
            <p className="mt-2 text-sm text-slate-400">
              Central inteligente de operações de infraestrutura
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-300">
              DEMO
            </span>
            <Bell size={21} />
          </div>
        </header>

        {page === "Dashboard" && (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Servidores", value: "4", icon: Server, color: "text-cyan-400" },
                { label: "Online", value: "2", icon: ShieldCheck, color: "text-emerald-400" },
                { label: "Warning", value: "1", icon: TriangleAlert, color: "text-amber-400" },
                { label: "Offline", value: "1", icon: Activity, color: "text-red-400" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-xl border border-slate-800 bg-[#102139] p-6">
                  <Icon className={color} size={25} />
                  <p className="mt-5 text-sm text-slate-400">{label}</p>
                  <p className="mt-1 text-3xl font-bold">{value}</p>
                </div>
              ))}
            </div>

            <section className="mb-7 rounded-xl border border-slate-800 bg-[#102139] p-6">
              <h3 className="mb-5 text-xl font-semibold">Disponibilidade da infraestrutura</h3>
              <div className="flex h-4 overflow-hidden rounded-full bg-slate-700">
                <div className="w-1/2 bg-emerald-500" />
                <div className="w-1/4 bg-amber-500" />
                <div className="w-1/4 bg-red-500" />
              </div>
              <p className="mt-4 text-sm text-slate-400">
                50% online · 25% warning · 25% offline — dados simulados
              </p>
            </section>
          </>
        )}

        {(page === "Dashboard" || page === "Servidores") && (
          <section className="mb-7 rounded-xl border border-slate-800 bg-[#102139] p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-semibold">Servidores monitorados</h3>
              <div className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2">
                <Search size={16} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Pesquisar servidor"
                  aria-label="Pesquisar servidor"
                  className="w-40 bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] text-left text-sm">
                <thead className="border-b border-slate-700 text-slate-400">
                  <tr>
                    <th className="pb-3">Equipamento</th>
                    <th className="pb-3">IP</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">CPU</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServers.map((server) => (
                    <tr key={server.name} className="border-b border-slate-800">
                      <td className="py-4 font-medium">{server.name}</td>
                      <td className="py-4 text-slate-400">{server.ip}</td>
                      <td className="py-4">
                        <span className={
                          server.status === "Online" ? "text-emerald-400" :
                          server.status === "Warning" ? "text-amber-400" : "text-red-400"
                        }>
                          ● {server.status}
                        </span>
                      </td>
                      <td className="py-4">{server.cpu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredServers.length === 0 && (
                <p className="py-5 text-sm text-slate-400">Nenhum servidor encontrado.</p>
              )}
            </div>
          </section>
        )}

        {(page === "Dashboard" || page === "Incidentes") && (
          <section className="rounded-xl border border-slate-800 bg-[#102139] p-6">
            <h3 className="mb-5 flex items-center gap-2 text-xl font-semibold">
              <TriangleAlert size={21} className="text-amber-400" />
              Incidentes recentes
            </h3>
            <div className="space-y-3">
              {incidents.map((incident) => (
                <div key={incident.id} className="flex flex-wrap justify-between gap-3 rounded-lg bg-[#081426] p-4">
                  <div>
                    <p className="font-medium">{incident.issue}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {incident.id} · {incident.equipment}
                    </p>
                  </div>
                  <span className="text-sm text-amber-300">{incident.severity}</span>
                </div>
              ))}
            </div>
          </section>
        )}

{page === "Análise IA" && <LogAnalyzer />}
        <footer className="mt-10 text-center text-xs text-slate-500">
          © 2026 Olga Tecnologia · GSC AI Log Analyzer · Ambiente de demonstração
        </footer>
      </main>
    </div>
  );
}

export default App;