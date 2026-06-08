// pages/api/get-firms.js
// GET ?country=Deutschland
// Returns top architecture firms for a country (size-appropriate list)

const COUNTRY_SIZES = {
  small: ["Liechtenstein","Luxemburg","Zypern","Malta","Estland","Lettland","Litauen","Slowenien","Kroatien","Albanien","Kosovo","Montenegro","Nordmazedonien","Bosnien","Moldau","Island","Bahrain","Katar","Kuwait","Brunei","Singapur","Israel","Libanon","Jordanien","Uruguay","Paraguay","Costa Rica","Panama","El Salvador","Honduras","Guatemala","Nicaragua","Bolivien","Ecuador","Ghana","Senegal","Tansania","Kenia","Äthiopien","Ruanda","Namibia","Botswana","Zimbabwe"],
  medium: ["Österreich","Schweiz","Belgien","Niederlande","Portugal","Dänemark","Schweden","Finnland","Norwegen","Tschechien","Ungarn","Polen","Rumänien","Bulgarien","Griechenland","Türkei","Mexiko","Argentinien","Chile","Kolumbien","Peru","Venezuela","Malaysia","Thailand","Vietnam","Indonesien","Philippinen","Pakistan","Bangladesh","Ägypten","Marokko","Algerien","Tunesien","Südafrika","Nigeria","Kenia"],
};

function getListSize(country) {
  if (COUNTRY_SIZES.small.includes(country)) return 5;
  if (COUNTRY_SIZES.medium.includes(country)) return 20;
  return 50; // large countries: Deutschland, USA, China, Japan, UK, Frankreich, Italien, Spanien, etc.
}

export default async function handler(req, res) {
  const { country } = req.query;
  if (!country) return res.status(400).json({ error: "country required" });

  const listSize = getListSize(country);

  const prompt = `List the top ${listSize} most important and internationally recognized architecture firms/offices from ${country}. Include both historic masters and contemporary firms. Mix individual architects and larger offices.

Return ONLY a JSON array, no markdown, no explanation:
[
  {"name": "Firm Name", "type": "office|individual", "known_for": "one short phrase"},
  ...
]

Order by international recognition and importance. Include both classical masters (if relevant) and contemporary offices.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const raw = data.content?.map(c => c.text || "").join("") || "";
    let parsed = null;
    const clean = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const start = clean.indexOf("[");
    const end = clean.lastIndexOf("]");
    if (start !== -1 && end !== -1) {
      try { parsed = JSON.parse(clean.substring(start, end + 1)); } catch (_) {}
    }
    if (!parsed) return res.status(500).json({ error: "Parse failed", raw: raw.substring(0, 200) });

    return res.status(200).json({ country, firms: parsed, total: parsed.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
export async function getServerSideProps() {
  return { props: {} };
}
