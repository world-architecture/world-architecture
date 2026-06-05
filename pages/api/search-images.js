export default async function handler(req, res) {
  const { q, limit = 9 } = req.query;
  if (!q) return res.status(400).json({ error: "q required" });

  const results = [];
  const terms = Array.isArray(q) ? q : [q];

  for (const term of terms.slice(0, 2)) {
    try {
      const s = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&srnamespace=6&srlimit=6&format=json&origin=*`);
      const sd = await s.json();
      if (!sd.query?.search?.length) continue;

      const titles = sd.query.search.map(r => r.title).join("|");
      const ir = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url|dimensions|extmetadata&iiurlwidth=1200&format=json&origin=*`);
      const id = await ir.json();

      for (const page of Object.values(id.query?.pages || {})) {
        const info = page.imageinfo?.[0];
        if (!info?.thumburl || !(info.mime || "").startsWith("image/")) continue;
        results.push({
          thumb: info.thumburl,
          fullUrl: info.url,
          title: (page.title || "").replace("File:", ""),
          license: info.extmetadata?.LicenseShortName?.value || "CC",
          author: (info.extmetadata?.Artist?.value || "Wikimedia").replace(/<[^>]*>/g, "").substring(0, 80)
        });
      }
    } catch (e) { console.error(e.message); }
  }

  return res.status(200).json(results.slice(0, parseInt(limit)));
}
