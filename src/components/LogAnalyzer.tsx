
import { useState, type ChangeEvent } from "react";
import ReactMarkdown from "react-markdown";
import {
  BrainCircuit,
  FileText,
  Upload,
  AlertTriangle,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

type Finding = {
  level: "Crítico" | "Alerta" | "Informação";
  line: number;
  content: string;
};

type AIResponse = {
  filename: string;
  model: string;
  analysis: string;
  characters_analyzed: number;
  truncated: boolean;
};

const API_URL = "http://127.0.0.1:8080";

export default function LogAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [content, setContent] = useState("");
  const [findings, setFindings] = useState<Finding[]>([]);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setSelectedFile(null);
    setContent("");
    setFindings([]);
    setAiResult(null);
    setAnalyzed(false);
    setError("");

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

      setSelectedFile(file);
      setContent(text);
    } catch {
      setError("Não foi possível ler o arquivo.");
    }
  }

  function analyzeByRules(text: string): Finding[] {
    const results: Finding[] = [];

    text.split(/\r?\n/).forEach((line, index) => {
      let level: Finding["level"] | null = null;

      if (/\b(fatal|critical|failed|failure|panic)\b/i.test(line)) {
        level = "Crítico";
      } else if (
        /\b(warning|warn|degraded|predictive failure)\b/i.test(line)
      ) {
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

    return results;
  }

  async function analyzeLog() {
    if (!selectedFile || loading) return;

    setLoading(true);
    setError("");
    setAnalyzed(false);
    setAiResult(null);

    // Análise inicial por regras no navegador.
    const localFindings = analyzeByRules(content);
    setFindings(localFindings);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail ||
            `Erro HTTP ${response.status} ao analisar o arquivo.`
        );
      }

      const result: AIResponse = await response.json();

      if (typeof result.analysis !== "string") {
        throw new Error("Resposta inválida recebida da API.");
      }

      setAiResult(result);
      setAnalyzed(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível conectar ao servidor de IA."
      );
      setAnalyzed(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-[#102139] p-6">
      <div className="mb-6 flex items-center gap-3">
        <BrainCircuit size={32} className="text-cyan-400" />

        <div>
          <h3 className="text-2xl font-semibold">
            GSC AI Log Analyzer
          </h3>

          <p className="text-sm text-slate-400">
            Diagnóstico de logs com FastAPI + Ollama + Llama 3.2
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
          disabled={loading}
          className="hidden"
        />
      </label>

      {selectedFile && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#081426] p-4">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-cyan-400" />

            <span className="break-all text-sm">
              {selectedFile.name}
            </span>
          </div>

          <button
            type="button"
            onClick={analyzeLog}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2 font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Analisando com IA...
              </>
            ) : (
              <>
                <BrainCircuit size={18} />
                Analisar arquivo com IA
              </>
            )}
          </button>
        </div>
      )}

      {loading && (
        <p role="status" className="mt-4 text-sm text-cyan-300">
          O Llama 3.2 está processando o arquivo. Aguarde o diagnóstico.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {error}
        </p>
      )}

      {analyzed && (
        <div className="mt-7 space-y-6">
          <div>
            <h4 className="mb-4 text-lg font-semibold">
              Análise por regras — {findings.length} ocorrência(s)
            </h4>

            {findings.length === 0 ? (
              <p className="text-sm text-slate-400">
                Nenhuma palavra-chave monitorada foi encontrada.
                Isso não garante que o equipamento esteja saudável.
              </p>
            ) : (
              <div className="max-h-[350px] space-y-3 overflow-y-auto">
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

          {aiResult && (
            <div className="rounded-xl border border-cyan-800 bg-[#081426] p-5">
              <div className="mb-4 flex items-center gap-3">
                <CheckCircle2 size={24} className="text-emerald-400" />

                <div>
                  <h4 className="text-lg font-semibold">
                    Diagnóstico técnico por IA
                  </h4>

                  <p className="text-xs text-slate-400">
                    Modelo: {aiResult.model}
                  </p>
                </div>
              </div>

              <div className="break-words text-sm leading-7 text-slate-200 [&_h1]:mb-4 [&_h1]:text-xl [&_h2]:my-4 [&_h2]:text-lg [&_h3]:my-3 [&_h3]:font-semibold [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_strong]:text-cyan-300">
  <ReactMarkdown>{aiResult.analysis}</ReactMarkdown>
              </div>

              <div className="mt-5 border-t border-slate-700 pt-3 text-xs text-slate-400">
                Caracteres analisados pela IA:{" "}
                {aiResult.characters_analyzed.toLocaleString("pt-BR")}
              </div>

              {aiResult.truncated && (
                <p className="mt-3 text-sm text-amber-300">
                  Atenção: o arquivo foi parcialmente analisado.
                  O backend limitou o conteúdo enviado à IA.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <p className="mt-6 text-xs text-amber-300">
        A análise por regras ocorre no navegador. O arquivo também é
        enviado ao FastAPI local para processamento pelo Ollama.
        Os diagnósticos da IA devem ser validados antes de qualquer
        intervenção em equipamentos de produção.
      </p>
    </section>
  );
}
