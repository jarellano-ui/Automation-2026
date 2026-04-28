import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const DB_DIR = path.join(__dirname, "data");
  const DB_FILE = path.join(DB_DIR, "db.json");

  // Ensure DB exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR);
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ handovers: [], tasks: [] }));
  }

  const getDB = () => JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  const saveDB = (db: any) => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

  // API Routes
  app.get("/api/handovers", (req, res) => {
    const db = getDB();
    res.json(db.handovers || []);
  });

  app.post("/api/handovers", (req, res) => {
    const db = getDB();
    const newHandover = req.body;
    db.handovers.push(newHandover);
    saveDB(db);
    res.json(newHandover);
  });

  app.put("/api/handovers", (req, res) => {
    const db = getDB();
    db.handovers = req.body;
    saveDB(db);
    res.json({ status: "ok" });
  });

  app.get("/api/tasks", (req, res) => {
    const db = getDB();
    res.json(db.tasks || []);
  });

  app.post("/api/tasks", (req, res) => {
    const db = getDB();
    const newTasks = req.body;
    db.tasks = newTasks; // For tasks, we often sync the whole board or updates
    saveDB(db);
    res.json({ status: "ok" });
  });

  app.get("/api/proxy-sheet", async (req, res) => {
    const month = req.query.month as string;
    if (!month) {
      return res.status(400).json({ error: "Month parameter is required" });
    }

    const sheetId = '11KIs2UlpayQn6ugWVtJETxE8ZjEH00uqgHBkgNFnQ9o';
    // Using gviz/tq endpoint to target specific sheet names
    const baseUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq`;
    const url = `${baseUrl}?tqx=out:csv&sheet=${encodeURIComponent(month.toUpperCase())}`;

    try {
      console.log(`Proxying request for spreadsheet month: ${month}`);
      const response = await fetch(url);
      
      if (response.status === 401 || response.status === 403) {
        console.error(`Spreadsheet Access Denied: 401/403 for month ${month}. The sheet is likely private.`);
        return res.status(401).json({ 
          error: "Access Denied (401). Please ensure your Spreadsheet is shared as 'Anyone with the link can view' AND 'Published to web' as a CSV.",
          details: "Google returned a login prompt instead of data."
        });
      }

      if (!response.ok) {
        const text = await response.text();
        console.error(`Spreadsheet response not OK: ${response.status}`, text.substring(0, 200));
        return res.status(response.status).json({ error: `Google Sheets error: ${response.status}`, details: text.substring(0, 100) });
      }
      const data = await response.text();
      res.header("Content-Type", "text/csv");
      res.send(data);
    } catch (error) {
      console.error('Proxy Fetch Error:', error);
      res.status(500).json({ error: "Failed to fetch spreadsheet data from Google" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
