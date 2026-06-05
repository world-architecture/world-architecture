// pages/api/render-video.js
// POST { script, images, audioBase64, format }
// format: "landscape" (YouTube 16:9) | "portrait" (TikTok/Reels 9:16) | "both"
// Returns Creatomate render job ID(s)

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { script, images, audioBase64, format = "both" } = req.body;
  if (!script || !images) return res.status(400).json({ error: "script and images required" });
  if (!process.env.CREATOMATE_API_KEY) return res.status(500).json({ error: "CREATOMATE_API_KEY not set" });

  // Build Creatomate render payload
  // Adjust template IDs to match your Creatomate templates
  const buildPayload = (templateId, outputFormat) => ({
    template_id: templateId,
    modifications: {
      // Intro
      "intro-text": script.intro.text,
      "architect-name": script.architect,
      "architect-country": script.country,
      // Projects
      ...script.projects.reduce((acc, project, i) => ({
        ...acc,
        [`project-${i+1}-title`]: project.name,
        [`project-${i+1}-year`]: project.year,
        [`project-${i+1}-location`]: project.location,
        [`project-${i+1}-text`]: project.text,
        [`project-${i+1}-image-1`]: images[i]?.[0]?.url || "",
        [`project-${i+1}-image-2`]: images[i]?.[1]?.url || "",
      }), {}),
      // Audio (base64 data URI)
      ...(audioBase64 ? { "voiceover": `data:audio/mpeg;base64,${audioBase64}` } : {})
    },
    output_format: outputFormat
  });

  const jobs = [];
  const formats = format === "both" ? ["landscape", "portrait"] : [format];

  for (const fmt of formats) {
    const templateId = fmt === "landscape"
      ? process.env.CREATOMATE_TEMPLATE_ID_LANDSCAPE
      : process.env.CREATOMATE_TEMPLATE_ID_PORTRAIT;

    if (!templateId) {
      jobs.push({ format: fmt, error: `Template ID for ${fmt} not set in env` });
      continue;
    }

    try {
      const response = await fetch("https://api.creatomate.com/v1/renders", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CREATOMATE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(buildPayload(templateId, fmt === "landscape" ? "mp4" : "mp4"))
      });

      if (!response.ok) {
        const err = await response.text();
        jobs.push({ format: fmt, error: err });
      } else {
        const data = await response.json();
        jobs.push({ format: fmt, renderId: data[0]?.id, status: data[0]?.status, url: data[0]?.url });
      }
    } catch (err) {
      jobs.push({ format: fmt, error: err.message });
    }
  }

  return res.status(200).json({ jobs });
}
