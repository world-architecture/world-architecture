import { useState } from "react";
import Head from "next/head";

const COUNTRIES = [
  "Deutschland","Japan","USA","Brasilien","Niederlande","Schweiz",
  "Spanien","Frankreich","China","Dänemark","Norwegen","Österreich",
  "Australien","Mexiko","Portugal","Indien","Singapur","Chile",
  "Schweden","Finnland","Großbritannien","Italien","Belgien","Polen"
];

export default function Home() {
  const [architectName, setArchitectName] = useState("");
  const [country, setCountry] = useState("Deutschland");
  const [language, setLanguage] = useState("Deutsch");
  const [autoUpload, setAutoUpload] = useState(false);
  const [pagePhase, setPagePhase] = useState("input");
  const [result, setResult] = useState(null);
  const [logItems, setLogItems] = useState([]);
  const [activeProj, setActiveProj] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);

  const bgColor = "#080808";
  const surfaceColor = "#0f0f0f";
  const borderColor = "#1e1e1e";
  const goldColor = "#b8935a";
  const textColor = "#ede8e0";
  const mutedColor = "#555";

  const inputStyle = {
    padding: "13px 16px",
    background: surfaceColor,
    border: `1px solid ${borderColor}`,
    color: textColor,
    fontSize: 15,
    outline: "none",
    fontFamily: "Georgia, serif",
    width: "100%",
    boxSizing: "border-box"
  };

  const runPipeline = async () => {
    if (!architectName.trim()) return;
    setPagePhase("loading");
    setLogItems([]);
    setResult(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ architect: architectName, country, language, autoUpload })
      });
      const data = await res.json();
      setLogItems(data.log || []);
      if (data.error) {
        setErrorMsg(data.error);
        setPagePhase("error");
        return;
      }
      setResult(data);
      setPagePhase("result");
      setActiveProj(0);
    } catch (e) {
      setErrorMsg(e.message);
      setPagePhase("error");
    }
  };

  const copyScript = () => {
    if (!result || !result.script) return;
    const s = result.script;
    const txt = `${s.architect} | ${s.country}\n\nINTRO\n${s.intro.text}\n\n` +
      s.projects.map((p, i) => `PROJEKT ${i+1}: ${p.name} (${p.year})\n${p.text}`).join("\n\n");
    navigator.clipboard.writeText(txt);
  };

  return (
    <>
      <Head>
        <title>World Architecture – Video Pipeline</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ minHeight: "100vh", background: bgColor, color: textColor, fontFamily: "Georgia, serif" }}>

        {/* Header */}
        <header style={{ padding: "0 20px", height: 50, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${borderColor}`, background: "#090909", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: goldColor, fontSize: 18 }}>◈</span>
            <span style={{ fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", color: "#777" }}>World Architecture</span>
          </div>
          {pagePhase === "result" && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={copyScript} style={{ padding: "6px 14px", background: surfaceColor, border: `1px solid ${borderColor}`, color: "#888", cursor: "pointer", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>
                ⎘ Skript
              </button>
              <button onClick={() => { setPagePhase("input"); setArchitectName(""); }} style={{ padding: "6px 14px", background: surfaceColor, border: `1px solid ${borderColor}`, color: goldColor, cursor: "pointer", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>
                + Neu
              </button>
            </div>
          )}
        </header>

        {/* INPUT */}
        {(pagePhase === "input" || pagePhase === "error") && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 50px)", padding: 20 }}>
            <div style={{ width: "100%", maxWidth: 480 }}>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <div style={{ fontSize: 48, color: goldColor, marginBottom: 14 }}>◈</div>
                <h1 style={{ fontSize: 24, fontWeight: "normal", letterSpacing: 2, margin: "0 0 6px" }}>Video Pipeline</h1>
                <p style={{ fontSize: 11, letterSpacing: "3px", color: mutedColor, textTransform: "uppercase", margin: 0 }}>
                  Skript · Bilder · Voiceover · Video · Upload
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  value={architectName}
                  onChange={e => setArchitectName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && runPipeline()}
                  placeholder="Architekt eingeben…"
                  style={{ ...inputStyle, fontSize: 18 }}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <select value={country} onChange={e => setCountry(e.target.value)} style={inputStyle}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select value={language} onChange={e => setLanguage(e.target.value)} style={inputStyle}>
                    <option>Deutsch</option>
                    <option>Englisch</option>
                  </select>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: surfaceColor, border: `1px solid ${borderColor}`, cursor: "pointer" }}>
                  <input type="checkbox" checked={autoUpload} onChange={e => setAutoUpload(e.target.checked)} style={{ accentColor: goldColor, width: 16, height: 16 }} />
                  <span style={{ fontSize: 13, color: mutedColor }}>Automatisch auf YouTube hochladen</span>
                </label>
                <button
                  onClick={runPipeline}
                  disabled={!architectName.trim()}
                  style={{ padding: 15, background: architectName.trim() ? goldColor : surfaceColor, color: architectName.trim() ? "#080808" : mutedColor, border: "none", cursor: architectName.trim() ? "pointer" : "default", fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", fontWeight: "bold", fontFamily: "Georgia, serif" }}>
                  ▶ Pipeline starten
                </button>
                {errorMsg && (
                  <div style={{ padding: "12px 16px", background: "#1a0808", border: "1px solid #3a1515", color: "#e06060", fontSize: 12 }}>
                    {errorMsg}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 36, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
                {["Skript","Bilder","Voice","Video","Upload"].map((s, i) => (
                  <div key={i} style={{ padding: "10px 4px", background: surfaceColor, border: `1px solid ${borderColor}`, textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: goldColor, marginBottom: 3 }}>0{i+1}</div>
                    <div style={{ fontSize: 10, color: mutedColor, letterSpacing: "1px" }}>{s}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LOADING */}
        {pagePhase === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 50px)", gap: 24, padding: 20 }}>
            <div style={{ fontSize: 42, color: goldColor }}>◈</div>
            <div style={{ fontSize: 14, letterSpacing: "2px", textTransform: "uppercase", color: mutedColor }}>Pipeline läuft…</div>
            <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 8 }}>
              {logItems.map((l, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", background: surfaceColor, border: `1px solid ${l.status === "done" ? goldColor : l.status === "failed" ? "#3a1515" : borderColor}` }}>
                  <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "1px", color: mutedColor }}>{l.step}</span>
                  <span style={{ fontSize: 12, color: l.status === "done" ? goldColor : l.status === "failed" ? "#e06060" : mutedColor }}>
                    {l.status === "done" ? "✓" : l.status === "failed" ? "✗" : "⏳"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULT */}
        {pagePhase === "result" && result && result.script && (
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
            <div style={{ borderBottom: `1px solid ${borderColor}`, paddingBottom: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 10, letterSpacing: "4px", color: goldColor, textTransform: "uppercase", marginBottom: 6 }}>
                {result.script.country}
              </div>
              <h2 style={{ fontSize: 30, fontWeight: "normal", fontStyle: "italic", margin: "0 0 12px" }}>{result.script.architect}</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.script.officialWebsite && (
                  <a href={`https://${result.script.officialWebsite}`} target="_blank" rel="noopener" style={{ padding: "5px 10px", border: `1px solid ${goldColor}`, color: goldColor, textDecoration: "none", fontSize: 10 }}>🌐 Website</a>
                )}
                {[
                  ["ArchDaily", `https://www.archdaily.com/search/all?q=${encodeURIComponent(result.script.architect)}`],
                  ["Dezeen", `https://www.dezeen.com/search/?q=${encodeURIComponent(result.script.architect)}`],
                  ["Wikimedia", `https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(result.script.architect)}&title=Special:MediaSearch&type=image`]
                ].map(([label, url]) => (
                  <a key={label} href={url} target="_blank" rel="noopener" style={{ padding: "5px 10px", border: `1px solid ${borderColor}`, color: mutedColor, textDecoration: "none", fontSize: 10 }}>{label}</a>
                ))}
              </div>
            </div>

            <div style={{ background: surfaceColor, border: `1px solid ${borderColor}`, padding: "18px 20px", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <span style={{ background: goldColor, color: "#080808", padding: "2px 9px", fontSize: 9, letterSpacing: "2px", fontWeight: "bold", textTransform: "uppercase" }}>INTRO</span>
                <span style={{ fontSize: 11, color: mutedColor }}>{result.script.intro.duration}</span>
              </div>
              <p style={{ lineHeight: 1.9, fontSize: 14, color: "#ccc", margin: 0 }}>{result.script.intro.text}</p>
            </div>

            <div style={{ display: "flex", gap: 2 }}>
              {result.script.projects.map((p, i) => (
                <button key={i} onClick={() => setActiveProj(i)} style={{
                  flex: 1, padding: "10px 4px", cursor: "pointer",
                  background: activeProj === i ? "#131313" : surfaceColor,
                  border: `1px solid ${activeProj === i ? goldColor : borderColor}`,
                  borderBottom: activeProj === i ? "1px solid #131313" : `1px solid ${borderColor}`,
                  color: activeProj === i ? goldColor : mutedColor,
                  fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", fontFamily: "Georgia, serif"
                }}>P{i+1}</button>
              ))}
            </div>

            {result.script.projects[activeProj] && (
              <div style={{ background: "#131313", border: `1px solid ${goldColor}`, borderTop: "none", padding: "18px 20px", marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontStyle: "italic", fontWeight: "normal", margin: "0 0 4px" }}>
                  {result.script.projects[activeProj].name}
                </h3>
                <div style={{ fontSize: 11, color: mutedColor, marginBottom: 14 }}>
                  {result.script.projects[activeProj].year} · {result.script.projects[activeProj].location}
                </div>
                <p style={{ lineHeight: 1.9, fontSize: 14, color: "#ccc", margin: "0 0 16px" }}>
                  {result.script.projects[activeProj].text}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {[
                    ["Wikimedia", `https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent((result.script.projects[activeProj].wikiSearch||[])[0]||result.script.projects[activeProj].name)}&title=Special:MediaSearch&type=image`],
                    result.script.officialWebsite && ["Website", `https://${result.script.officialWebsite}`],
                    ["ArchDaily", `https://www.archdaily.com/search/all?q=${encodeURIComponent(result.script.projects[activeProj].name)}`],
                    ["Google Bilder", `https://www.google.com/search?q=${encodeURIComponent(result.script.projects[activeProj].googleImages||result.script.projects[activeProj].name)}&tbm=isch`],
                  ].filter(Boolean).map(([label, url]) => (
                    <a key={label} href={url} target="_blank" rel="noopener" style={{ padding: "5px 9px", border: `1px solid ${borderColor}`, color: mutedColor, textDecoration: "none", fontSize: 9 }}>{label} →</a>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
              {result.script.projects.map((p, i) => (
                <div key={i} onClick={() => setActiveProj(i)} style={{ padding: "12px 14px", cursor: "pointer", background: "#0a0a0a", border: `1px solid ${activeProj === i ? goldColor : borderColor}` }}>
                  <div style={{ fontSize: 9, color: mutedColor, marginBottom: 4 }}>P{i+1} · {p.year}</div>
                  <div style={{ fontSize: 12, color: activeProj === i ? goldColor : "#777" }}>{p.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
