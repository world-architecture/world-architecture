// pages/api/generate-voiceover.js
// POST { text, voiceId?, stability?, style? }
// Returns audio buffer as base64 (mp3)

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const {
    text,
    voiceId = process.env.ELEVENLABS_VOICE_ID || "pNInz6obpgDQGcFmaJgB", // Adam (English)
    stability = 0.40,        // 35-45% = most human
    similarityBoost = 0.75,
    style = 0.15,            // low = more natural
    modelId = "eleven_multilingual_v2"
  } = req.body;

  if (!text) return res.status(400).json({ error: "text required" });
  if (!process.env.ELEVENLABS_API_KEY) return res.status(500).json({ error: "ELEVENLABS_API_KEY not set" });

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: `ElevenLabs error: ${err}` });
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({
      audio: base64,
      mimeType: "audio/mpeg",
      size: buffer.byteLength
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
