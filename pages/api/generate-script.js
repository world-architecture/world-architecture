const SYSTEM_PROMPT = `You are a professional architecture content creator for a faceless YouTube/TikTok channel.
Respond ONLY with a single valid JSON object. No markdown, no backticks, nothing else.

Format:
{
  "architect": "Full Name",
  "country": "Country",
  "born": "birth year",
  "officialWebsite": "domain.com",
  "intro": {
    "duration": "30-45 sec",
    "text": "90 words. Gripping storytelling biography. Energy, emotion, hook."
  },
  "projects": [
    {
      "name": "Project Name",
      "year": "completion year",
      "location": "City, Country",
      "duration": "45-60 sec",
      "text": "110 words. What is the architectural concept? What makes it unique? Emotional impact. Tell a story, not facts.",
      "wikiSearch": ["English search term with project + architect name", "alternative English term"],
      "googleImages": "optimized Google image search in English",
      "archdailySearch": "project name for ArchDaily"
    }
  ]
}

Exactly 4 projects. wikiSearch MUST be in English.`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { architect, country, language = "German" } = req.body;
  if (!architect || !country) return res.status(400).json({ error: "architect and country required" });

  const userMsg = language === "Deutsch"
    ? `Schreibe das Voiceover-Skript auf DEUTSCH für: "${architect}" aus ${country}. Exakt 4 Projekte. NUR JSON.`
    : `Write the voiceover script in ENGLISH for: "${architect}" from ${country}. Exactly 4 projects. ONLY JSON.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 2500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMsg }]
      })
    });

    const data = await response.json();
    const raw = data.content?.map(c => c.text || "").join("") || "";

    let parsed = null;
    for (const attempt of [raw.trim(), raw.replace(/```json|```/g, "").trim(), raw.substring(raw.indexOf("{"), raw.lastIndexOf("}") + 1)]) {
      try { parsed = JSON.parse(attempt); break; } catch (_) {}
    }

    if (!parsed) return res.status(500).json({ error: "Parse failed", raw: raw.substring(0, 300) });
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
