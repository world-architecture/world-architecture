import { useState } from "react";
import Head from "next/head";

export async function getServerSideProps() {
  return { props: {} };
}

const COUNTRIES = [
  { name: "Deutschland", flag: "🇩🇪" },
  { name: "Japan", flag: "🇯🇵" },
  { name: "USA", flag: "🇺🇸" },
  { name: "Brasilien", flag: "🇧🇷" },
  { name: "Niederlande", flag: "🇳🇱" },
  { name: "Schweiz", flag: "🇨🇭" },
  { name: "Spanien", flag: "🇪🇸" },
  { name: "Frankreich", flag: "🇫🇷" },
  { name: "China", flag: "🇨🇳" },
  { name: "Daenemark", flag: "🇩🇰" },
  { name: "Norwegen", flag: "🇳🇴" },
  { name: "Oesterreich", flag: "🇦🇹" },
  { name: "Australien", flag: "🇦🇺" },
  { name: "Mexiko", flag: "🇲🇽" },
  { name: "Portugal", flag: "🇵🇹" },
  { name: "Indien", flag: "🇮🇳" },
  { name: "Singapur", flag: "🇸🇬" },
  { name: "Chile", flag: "🇨🇱" },
  { name: "Schweden", flag: "🇸🇪" },
  { name: "Finnland", flag: "🇫🇮" },
  { name: "Grossbritannien", flag: "🇬🇧" },
  { name: "Italien", flag: "🇮🇹" },
  { name: "Belgien", flag: "🇧🇪" },
  { name: "Polen", flag: "🇵🇱" },
  { name: "Suedkorea", flag: "🇰🇷" },
  { name: "Israel", flag: "🇮🇱" },
  { name: "Argentinien", flag: "🇦🇷" },
  { name: "Kanada", flag: "🇨🇦" },
  { name: "Ghana", flag: "🇬🇭" },
  { name: "Tuerkei", flag: "🇹🇷" }
];

export default function Home() {
  var screen = useState("countries");
  var screenVal = screen[0];
  var setScreen = screen[1];

  var countryState = useState(null);
  var selectedCountry = countryState[0];
  var setSelectedCountry = countryState[1];

  var langState = useState("Deutsch");
  var language = langState[0];
  var setLanguage = langState[1];

  var firmsState = useState([]);
  var firms = firmsState[0];
  var setFirms = firmsState[1];

  var firmsLoadingState = useState(false);
  var firmsLoading = firmsLoadingState[0];
  var setFirmsLoading = firmsLoadingState[1];

  var resultState = useState(null);
  var result = resultState[0];
  var setResult = resultState[1];

  var logState = useState([]);
  var logItems = logState[0];
  var setLogItems = logState[1];

  var projState = useState(0);
  var activeProj = projState[0];
  var setActiveProj = projState[1];

  var errState = useState(null);
  var errMsg = errState[0];
  var setErrMsg = errState[1];

  var manualState = useState("");
  var manualName = manualState[0];
  var setManualName = manualState[1];

  function selectCountry(c) {
    setSelectedCountry(c);
    setFirms([]);
    setErrMsg(null);
    setFirmsLoading(true);
    setScreen("firms");
    fetch("/api/get-firms?country=" + encodeURIComponent(c.name))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        setFirms(data.firms || []);
        setFirmsLoading(false);
      })
      .catch(function(e) {
        setErrMsg("Fehler: " + e.message);
        setFirmsLoading(false);
      });
  }

  function runPipeline(firmName) {
    setScreen("loading");
    setLogItems([]);
    setResult(null);
    setErrMsg(null);
    fetch("/api/pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        architect: firmName,
        country: selectedCountry ? selectedCountry.name : "Deutschland",
        language: language
      })
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        setLogItems(data.log || []);
        if (data.error) {
          setErrMsg(data.error);
          setScreen("firms");
          return;
        }
        setResult(data);
        setScreen("result");
        setActiveProj(0);
      })
      .catch(function(e) {
        setErrMsg(e.message);
        setScreen("firms");
      });
  }

  var gold = "#b8935a";
  var bg = "#080808";
  var surface = "#0f0f0f";
  var border = "#1e1e1e";
  var muted = "#555";
  var textCol = "#ede8e0";

  return (
    <>
      <Head>
        <title>World Architecture</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ minHeight: "100vh", background: bg, color: textCol, fontFamily: "Georgia, serif" }}>

        <header style={{ height: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: "1px solid " + border, background: "#090909", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: gold, fontSize: 18 }}>◈</span>
            <span style={{ fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", color: "#777" }}>World Architecture</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select value={language} onChange={function(e) { setLanguage(e.target.value); }}
              style={{ padding: "4px 8px", background: surface, border: "1px solid " + border, color: muted, fontSize: 11, fontFamily: "Georgia, serif" }}>
              <option>Deutsch</option>
              <option>Englisch</option>
            </select>
            {screenVal !== "countries" && (
              <button onClick={function() { setScreen("countries"); }}
                style={{ padding: "5px 12px", background: surface, border: "1px solid " + border, color: gold, cursor: "pointer", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>
                ← Länder
              </button>
            )}
            {screenVal === "result" && (
              <button onClick={function() { setScreen("firms"); }}
                style={{ padding: "5px 12px", background: surface, border: "1px solid " + border, color: muted, cursor: "pointer", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>
                ← Büros
              </button>
            )}
          </div>
        </header>

        {screenVal === "countries" && (
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 48, color: gold, marginBottom: 12 }}>◈</div>
              <h1 style={{ fontSize: 22, fontWeight: "normal", letterSpacing: 2, margin: "0 0 8px" }}>World Architecture Pipeline</h1>
              <p style={{ fontSize: 11, letterSpacing: "3px", color: muted, textTransform: "uppercase", margin: 0 }}>
                Land wählen → Top-Büros erscheinen → Video generieren
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
              {COUNTRIES.map(function(c) {
                return (
                  <button key={c.name} onClick={function() { selectCountry(c); }}
                    style={{ padding: "16px 12px", background: surface, border: "1px solid " + border, color: textCol, cursor: "pointer", fontFamily: "Georgia, serif", textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{c.flag}</div>
                    <div style={{ fontSize: 12 }}>{c.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {screenVal === "firms" && selectedCountry && (
          <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
              <span style={{ fontSize: 36 }}>{selectedCountry.flag}</span>
              <div>
                <div style={{ fontSize: 10, letterSpacing: "4px", color: gold, textTransform: "uppercase", marginBottom: 4 }}>Top Büros</div>
                <h2 style={{ fontSize: 24, fontWeight: "normal", margin: 0 }}>{selectedCountry.name}</h2>
              </div>
            </div>

            {errMsg && (
              <div style={{ padding: "12px 16px", background: "#1a0808", border: "1px solid #3a1515", color: "#e06060", fontSize: 12, marginBottom: 16 }}>
                {errMsg}
              </div>
            )}

            {firmsLoading && (
              <div style={{ textAlign: "center", padding: "40px 0", color: muted }}>
                <div style={{ fontSize: 32, color: gold, marginBottom: 12 }}>◈</div>
                <div style={{ fontSize: 12, letterSpacing: "2px", textTransform: "uppercase" }}>Lade Top-Büros…</div>
              </div>
            )}

            {!firmsLoading && firms.length > 0 && (
              <div>
                <div style={{ fontSize: 10, letterSpacing: "2px", color: muted, textTransform: "uppercase", marginBottom: 12 }}>
                  {firms.length} Büros — anklicken zum Generieren
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 20 }}>
                  {firms.map(function(firm, i) {
                    return (
                      <button key={i} onClick={function() { runPipeline(firm.name); }}
                        style={{ padding: "14px 18px", background: surface, border: "1px solid " + border, color: textCol, cursor: "pointer", fontFamily: "Georgia, serif", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 14 }}>{firm.name}</div>
                          <div style={{ fontSize: 11, color: muted, marginTop: 3 }}>{firm.known_for}</div>
                        </div>
                        <span style={{ color: gold, fontSize: 16 }}>▶</span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ paddingTop: 16, borderTop: "1px solid " + border }}>
                  <div style={{ fontSize: 10, color: muted, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8 }}>Oder manuell eingeben</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={manualName} onChange={function(e) { setManualName(e.target.value); }}
                      placeholder="Büroname…"
                      style={{ flex: 1, padding: "10px 14px", background: surface, border: "1px solid " + border, color: textCol, fontSize: 14, outline: "none", fontFamily: "Georgia, serif" }} />
                    <button onClick={function() { if (manualName.trim()) runPipeline(manualName.trim()); }}
                      style={{ padding: "10px 20px", background: gold, color: bg, border: "none", cursor: "pointer", fontSize: 11, fontWeight: "bold", fontFamily: "Georgia, serif" }}>▶</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {screenVal === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 50px)", gap: 24 }}>
            <div style={{ fontSize: 48, color: gold }}>◈</div>
            <div style={{ fontSize: 13, letterSpacing: "2px", textTransform: "uppercase", color: muted }}>Pipeline läuft…</div>
            <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 6 }}>
              {["script", "images", "voiceover", "video"].map(function(step) {
                var item = logItems.find(function(l) { return l.step === step; });
                var label = step === "script" ? "📝 Skript" : step === "images" ? "🖼 Bilder" : step === "voiceover" ? "🎙 Voiceover" : "🎬 Video";
                var iconColor = !item ? muted : item.status === "done" ? gold : item.status === "skipped" ? "#333" : item.status === "failed" ? "#e06060" : muted;
                var icon = !item ? "⏳" : item.status === "done" ? "✓" : item.status === "skipped" ? "—" : item.status === "failed" ? "✗" : "⏳";
                return (
                  <div key={step} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: surface, border: "1px solid " + (item && item.status === "done" ? gold : border) }}>
                    <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "1px", color: muted }}>{label}</span>
                    <span style={{ fontSize: 13, color: iconColor }}>{icon}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {screenVal === "result" && result && result.script && (
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
            <div style={{ borderBottom: "1px solid " + border, paddingBottom: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 10, letterSpacing: "4px", color: gold, textTransform: "uppercase", marginBottom: 6 }}>
                {selectedCountry && selectedCountry.flag} {result.script.country}
              </div>
              <h2 style={{ fontSize: 30, fontWeight: "normal", fontStyle: "italic", margin: "0 0 12px" }}>{result.script.architect}</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.script.officialWebsite && (
                  <a href={"https://" + result.script.officialWebsite} target="_blank" rel="noopener"
                    style={{ padding: "5px 10px", border: "1px solid " + gold, color: gold, textDecoration: "none", fontSize: 10 }}>🌐 Website</a>
                )}
                <a href={"https://www.archdaily.com/search/all?q=" + encodeURIComponent(result.script.architect)} target="_blank" rel="noopener"
                  style={{ padding: "5px 10px", border: "1px solid " + border, color: muted, textDecoration: "none", fontSize: 10 }}>ArchDaily</a>
                <a href={"https://www.dezeen.com/search/?q=" + encodeURIComponent(result.script.architect)} target="_blank" rel="noopener"
                  style={{ padding: "5px 10px", border: "1px solid " + border, color: muted, textDecoration: "none", fontSize: 10 }}>Dezeen</a>
              </div>
            </div>

            <div style={{ background: surface, border: "1px solid " + border, padding: "18px 20px", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <span style={{ background: gold, color: bg, padding: "2px 9px", fontSize: 9, letterSpacing: "2px", fontWeight: "bold", textTransform: "uppercase" }}>INTRO</span>
                <span style={{ fontSize: 11, color: muted }}>{result.script.intro.duration}</span>
              </div>
              <p style={{ lineHeight: 1.9, fontSize: 14, color: "#ccc", margin: 0 }}>{result.script.intro.text}</p>
            </div>

            <div style={{ display: "flex", gap: 2 }}>
              {result.script.projects.map(function(p, i) {
                return (
                  <button key={i} onClick={function() { setActiveProj(i); }}
                    style={{ flex: 1, padding: "10px 4px", cursor: "pointer", background: activeProj === i ? "#131313" : surface, border: "1px solid " + (activeProj === i ? gold : border), borderBottom: activeProj === i ? "1px solid #131313" : "1px solid " + border, color: activeProj === i ? gold : muted, fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>
                    P{i+1}
                  </button>
                );
              })}
            </div>

            {result.script.projects[activeProj] && (
              <div style={{ background: "#131313", border: "1px solid " + gold, borderTop: "none", padding: "18px 20px", marginBottom: 16 }}>
                <h3 style={{ fontSize: 18, fontStyle: "italic", fontWeight: "normal", margin: "0 0 4px" }}>{result.script.projects[activeProj].name}</h3>
                <div style={{ fontSize: 11, color: muted, marginBottom: 14 }}>
                  {result.script.projects[activeProj].year} · {result.script.projects[activeProj].location}
                </div>
                <p style={{ lineHeight: 1.9, fontSize: 14, color: "#ccc", margin: "0 0 14px" }}>
                  {result.script.projects[activeProj].text}
                </p>
                {result.images && result.images[activeProj] && result.images[activeProj].length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 9, letterSpacing: "2px", color: muted, textTransform: "uppercase", marginBottom: 8 }}>Wikimedia Bilder</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
                      {result.images[activeProj].slice(0, 6).map(function(img, ii) {
                        return <img key={ii} src={img.thumb} alt={img.title} style={{ width: "100%", height: 80, objectFit: "cover", display: "block" }} />;
                      })}
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  <a href={"https://commons.wikimedia.org/w/index.php?search=" + encodeURIComponent((result.script.projects[activeProj].wikiSearch || [])[0] || result.script.projects[activeProj].name) + "&title=Special:MediaSearch&type=image"} target="_blank" rel="noopener"
                    style={{ padding: "5px 9px", border: "1px solid " + border, color: muted, textDecoration: "none", fontSize: 9 }}>Wikimedia →</a>
                  <a href={"https://www.archdaily.com/search/all?q=" + encodeURIComponent(result.script.projects[activeProj].name)} target="_blank" rel="noopener"
                    style={{ padding: "5px 9px", border: "1px solid " + border, color: muted, textDecoration: "none", fontSize: 9 }}>ArchDaily →</a>
                  <a href={"https://www.google.com/search?q=" + encodeURIComponent(result.script.projects[activeProj].googleImages || result.script.projects[activeProj].name) + "&tbm=isch"} target="_blank" rel="noopener"
                    style={{ padding: "5px 9px", border: "1px solid " + border, color: muted, textDecoration: "none", fontSize: 9 }}>Google Bilder →</a>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
              {result.script.projects.map(function(p, i) {
                return (
                  <div key={i} onClick={function() { setActiveProj(i); }}
                    style={{ padding: "12px 14px", cursor: "pointer", background: "#0a0a0a", border: "1px solid " + (activeProj === i ? gold : border) }}>
                    <div style={{ fontSize: 9, color: muted, marginBottom: 4 }}>P{i+1} · {p.year}</div>
                    <div style={{ fontSize: 12, color: activeProj === i ? gold : "#777" }}>{p.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
