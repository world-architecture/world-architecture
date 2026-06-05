// pages/api/search-images.js
// GET ?q=search+term&limit=9
// Returns array of CC-licensed images from Wikimedia Commons

export default async function handler(req, res) {
  const { q, limit = 9 } = req.query;
  if (!q) return res.status(400).json({ error: "q parameter required" });

  const results = [];
  const terms = Array.isArray(q) ? q : [q];

  for (const term of terms.slice(0, 2)) {
    try {
      // Step 1: Search for image files
      const searchRes = await fetch(
        `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&srnamespace=6&srlimit=6&format=json&origin=*`
      );
      const searchData = await searchRes.json();
      if (!searchData.query?.search?.length) continue;

      // Step 2: Get image URLs + metadata
      const titles = searchData.query.search.map(r => r.title).join("|");
      const infoRes = await fetch(
        `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url|dimensions|extmetadata&iiurlwidth=1200&format=json&origin=*`
      );
      const infoData = await infoRes.json();

      for (const page of Object.values(infoData.query?.pages || {})) {
        const info = page.imageinfo?.[0];
        if (!info?.thumburl) continue;
        if (!(info.mime || "").startsWith("image/")) continue;

        const license = info.extmetadata?.LicenseShortName?.value || "CC";
        const author = (info.extmetadata?.Artist?.value || "Wikimedia")
          .replace(/<[^>]*>/g, "").substring(0, 80);
        const description = (info.extmetadata?.ImageDescription?.value || "")
          .replace(/<[^>]*>/g, "").substring(0, 120);

        results.push({
          thumb: info.thumburl,
          fullUrl: info.url,
          title: (page.title || "").replace("File:", ""),
          license,
          author,
          description,
          width: info.width,
          height: info.height
        });
      }
    } catch (e) {
      console.error("Wikimedia error:", e.message);
    }
  }

  return res.status(200).json(results.slice(0, parseInt(limit)));
}
