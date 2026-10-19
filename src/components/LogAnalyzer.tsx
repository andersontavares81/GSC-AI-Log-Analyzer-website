import { useState, type ChangeEvent } from "react";
import { BrainCircuit, FileText, Upload, AlertTriangle } from "lucide-react";

type Finding = {
  level: "Crítico" | "Alerta" | "Informação";
  line: number;
  content: string;
};

export default function LogAnalyzer() {
  const [fileName, setFileName] = useState("");
  const [content, setContent] = useState("");
  const [findings, setFindings] = useState<Finding[]>([]);
  const [analyzed, setAnalyzed] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError("");
    setFindings([]);
    setAnalyzed(false);
    setContent("");
    setFileName("");

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("O arquivo deve ter no máximo 5 MB.");
      return;
    }

    if (!/\.(log|txt|csv)$/i.test(file.name)) {
      setError("Formato não permitido. Utilize .log, .txt ou .csv.");
      return;
    }

    try {
      const text = await file.text();
      setFileName(file.name);
      setContent(text);
    } catch {
      setError("Não foi possível ler o arquivo.");
    }
  }

  function analyzeLog() {
    const results: Finding[] = [];

    content.split(/\r?\n/).forEach((line, index) => {
      let level: Finding["level"] | null = null;

      if (/\b(fatal|critical|failed|failure|panic)\b/i.test(line)) {
        level = "Crítico";
      } else if (/\b(warning|warn|degraded|predictive failure)\b/i.test(line)) {
        level = "Alerta";
      } else if (/\b(error|timeout|offline)\b/i.test(line)) {
        level = "Informação";
      }

      if (level) {
        results.push({
          level,
          line: index + 1,
          content: line.slice(0, 500),
        });
      }
    });

    setFindings(results);
    setAnalyzed(true);
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-[#102139] p-6">
      <div className="mb-6 flex items-center gap-3">
        <BrainCircuit size={32} className="text-cyan-400" />
        <div>
          <h3 className="text-2xl font-semibold">Analisador de Logs</h3>
          <p className="text-sm text-slate-400">
            Análise local por regras — versão inicial
          </p>
        </div>
      </div>

      <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-cyan-700 p-8 text-center hover:bg-slate-800/40">
        <Upload size={30} className="text-cyan-400" />
        <span>Selecionar arquivo de log</span>
        <span className="text-xs text-slate-400">
          Formatos: .log, .txt e .csv — máximo 5 MB
        </span>
        <input
          type="file"
          accept=".log,.txt,.csv"
          onChange={handleUpload}
          className="hidden"
        />
      </label>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {error}
        </p>
      )}

      {fileName && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#081426] p-4">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-cyan-400" />
            <span className="break-all text-sm">{fileName}</span>
          </div>

          <button
            onClick={analyzeLog}
            className="rounded-lg bg-cyan-500 px-5 py-2 font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Analisar arquivo
          </button>
        </div>
      )}

      {analyzed && (
        <div className="mt-7">
          <h4 className="mb-4 text-lg font-semibold">
            Resultado da análise — {findings.length} ocorrência(s)
          </h4>

          {findings.length === 0 ? (
            <p className="text-slate-400">
              Nenhuma das palavras-chave monitoradas foi encontrada.
              Isso não garante que o equipamento esteja saudável.
            </p>
          ) : (
            <div className="max-h-[450px] space-y-3 overflow-y-auto">
              {findings.map((finding, index) => (
                <div
                  key={`${finding.line}-${index}`}
                  className="rounded-lg border border-slate-700 bg-[#081426] p-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <AlertTriangle
                      size={17}
                      className={
                        finding.level === "Crítico"
                          ? "text-red-400"
                          : finding.level === "Alerta"
                          ? "text-amber-400"
                          : "text-sky-400"
                      }
                    />
                    <strong>{finding.level}</strong>
                    <span className="text-xs text-slate-400">
                      Linha {finding.line}
                    </span>
                  </div>

                  <pre className="whitespace-pre-wrap break-all text-xs text-slate-300">
                    {finding.content}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="mt-6 text-xs text-amber-300">
        Os arquivos são processados somente no navegador nesta versão.
        Não há envio para servidor ou serviço de IA.
      </p>
    </section>
  );
}