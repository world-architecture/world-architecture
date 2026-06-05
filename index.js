// pages/api/pipeline.js
// POST { architect, country, language, upload: true/false }
// Orchestrates: Script → Images → Voiceover → Video → Upload
// Returns step-by-step status (use with streaming or polling)

export const config = { maxDuration: 300 }; // 5 min timeout on Vercel Pro

async function callInternal(req, path, body) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000`;
  const res = await fetch(`${base}/api/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const {
    architect,
    country,
    language = "Deutsch",
    autoUpload = false
  } = req.body;

  if (!architect || !country) return res.status(400).json({ error: "architect and country required" });

  const log = [];
  const addLog = (step, status, data = {}) => log.push({ step, status, data, ts: new Date().toISOString() });

  // ── STEP 1: Generate Script ────────────────────────────
  addLog("script", "running");
  const script = await callInternal(req, "generate-script", { architect, country, language });
  if (script.error) {
    addLog("script", "failed", { error: script.error });
    return res.status(500).json({ log, error: script.error });
  }
  addLog("script", "done", { architect: script.architect, projects: script.projects?.length });

  // ── STEP 2: Search Images for all 4 projects ───────────
  addLog("images", "running");
  const allImages = {};
  for (let i = 0; i < (script.projects?.length || 0); i++) {
    const p = script.projects[i];
    const terms = (p.wikiSearch || [p.name]).map(t => encodeURIComponent(t)).join("&q=");
    const imgRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/search-images?q=${terms}&limit=6`
    );
    allImages[i] = await imgRes.json();
  }
  addLog("images", "done", { found: Object.values(allImages).map(imgs => imgs.length) });

  // ── STEP 3: Generate Voiceover ─────────────────────────
  addLog("voiceover", "running");
  const fullScript = `${script.intro.text}\n\n` +
    script.projects.map(p => p.text).join("\n\n");

  const voiceRes = await callInternal(req, "generate-voiceover", { text: fullScript });
  if (voiceRes.error) {
    addLog("voiceover", "failed", { error: voiceRes.error });
    // Continue without audio
  } else {
    addLog("voiceover", "done", { size: voiceRes.size });
  }

  // ── STEP 4: Render Video ───────────────────────────────
  addLog("video", "running");
  const renderRes = await callInternal(req, "render-video", {
    script,
    images: allImages,
    audioBase64: voiceRes?.audio || null,
    format: "both"
  });

  if (renderRes.error || renderRes.jobs?.every(j => j.error)) {
    addLog("video", "failed", { error: renderRes.error || renderRes.jobs });
  } else {
    addLog("video", "rendering", { jobs: renderRes.jobs });
  }

  // ── STEP 5: Upload (optional) ──────────────────────────
  if (autoUpload && renderRes.jobs) {
    const landscapeJob = renderRes.jobs.find(j => j.format === "landscape" && j.url);
    if (landscapeJob?.url) {
      addLog("upload", "running");
      const uploadRes = await callInternal(req, "upload-youtube", {
        videoUrl: landscapeJob.url,
        title: `${script.architect} – Top Architekturprojekte | World Architecture`,
        description: `${script.intro.text}\n\n${script.projects.map((p, i) => `${i+1}. ${p.name} (${p.year}, ${p.location})\n${p.text}`).join("\n\n")}\n\n#Architecture #${script.country} #Design`,
        tags: [script.architect, script.country, "Architecture", "Design", "Buildings", "WorldArchitecture"]
      });
      addLog("upload", uploadRes.success ? "done" : "failed", uploadRes);
    }
  }

  return res.status(200).json({ log, script, images: allImages, renderJobs: renderRes.jobs || [] });
}
