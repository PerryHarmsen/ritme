// Kleine webserver voor Ritme (gewoonte-app).
// - Serveert de bestanden in deze map op http://localhost:8777
// - Stuurt /api/... door naar Ollama (het lokale AI-model) voor de coach
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8778;   // 8765 = Jarvis, 8777 = leerapp
const ROOT = __dirname;
const OLLAMA = { host: "127.0.0.1", port: 11434 }; // 127.0.0.1, niet localhost (sneller op Windows)
const TYPES = { ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".json": "application/json", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".png": "image/png" };

// Sterker cloudmodel via OpenRouter. De sleutel komt uit de Jarvis-instellingen
// en blijft op de server: de browser krijgt hem nooit te zien.
const CLOUD_MODEL = "anthropic/claude-haiku-5.5";
function openrouterKey() {
  try {
    const t = fs.readFileSync(path.join(__dirname, "..", "jarvis-home", "credentials.toml"), "utf8");
    return (t.match(/^OPENROUTER_API_KEY\s*=\s*"([^"]+)"/m) || [])[1] || null;
  } catch (e) { return null; }
}
function cloudChat(req, res) {
  let body = "";
  req.on("data", d => body += d);
  req.on("end", async () => {
    res.writeHead(200, { "Content-Type": "application/x-ndjson" });
    const key = openrouterKey();
    if (!key) return res.end(JSON.stringify({ error: "Geen OpenRouter-sleutel gevonden in jarvis-home/credentials.toml" }) + "\n");
    try {
      const vraag = JSON.parse(body);
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json", "X-Title": "Ritme" },
        body: JSON.stringify({ model: CLOUD_MODEL, temperature: 0.3, max_tokens: 1200, messages: vraag.messages })
      });
      const j = await r.json();
      if (!j.choices) return res.end(JSON.stringify({ error: (j.error && j.error.message) || "OpenRouter gaf geen antwoord" }) + "\n");
      if (!j.choices[0].message.content) {
        console.log("Leeg cloud-antwoord:", JSON.stringify(j).slice(0, 600));
        return res.end(JSON.stringify({ error: "Leeg antwoord van het cloudmodel (" + (j.choices[0].finish_reason || "onbekend") + ")" }) + "\n");
      }
      // Zelfde formaat als Ollama, zodat de app maar één manier van lezen nodig heeft
      const afgekapt = j.choices[0].finish_reason === "length" ? "\n\n(…antwoord afgekapt, vraag gerust: ga verder)" : "";
      res.end(JSON.stringify({ message: { content: j.choices[0].message.content + afgekapt }, done: true }) + "\n");
    } catch (e) {
      res.end(JSON.stringify({ error: "Geen verbinding met OpenRouter (internet?)" }) + "\n");
    }
  });
}

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  if (url === "/api/cloud") return cloudChat(req, res);
  if (url === "/api/cloud-status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ beschikbaar: !!openrouterKey(), model: CLOUD_MODEL }));
  }

  // Doorsturen naar Ollama (alleen chat en modellenlijst)
  if (url === "/api/chat" || url === "/api/tags") {
    const proxy = http.request({ ...OLLAMA, path: url, method: req.method, headers: { "Content-Type": "application/json" } }, (up) => {
      res.writeHead(up.statusCode, { "Content-Type": up.headers["content-type"] || "application/json" });
      up.pipe(res);
    });
    proxy.on("error", () => {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Ollama is niet bereikbaar. Draait Ollama?" }));
    });
    req.pipe(proxy);
    return;
  }

  // Gewone bestanden
  const file = path.join(ROOT, path.normalize(url === "/" ? "/index.html" : url));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Niet gevonden"); }
    // no-store: na een update van de lesstof zie je meteen de nieuwe versie
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(data);
  });
});

// Met --open opent de browser vanzelf zodra de server klaar is
function openBrowser() {
  if (process.argv.includes("--open")) require("child_process").exec('start "" "http://localhost:' + PORT + '"');
}

server.on("error", (e) => {
  if (e.code === "EADDRINUSE") { console.log("Ritme draait al op http://localhost:" + PORT); openBrowser(); }
  else console.error(e);
  setTimeout(() => process.exit(0), 1500);
});
server.listen(PORT, "127.0.0.1", () => {
  openBrowser();
  console.log("Ritme draait op http://localhost:" + PORT);
  console.log("Laat dit venster open zolang je de app gebruikt (nodig voor de AI-coach). Sluiten = app stoppen.");
});
