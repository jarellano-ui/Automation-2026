import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_URL = process.env.APP_URL || "http://localhost:3000";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  const DB_DIR = path.join(__dirname, "data");
  const DB_FILE = path.join(DB_DIR, "db.json");

  // Ensure DB exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR);
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ 
      handovers: [], 
      tasks: [],
      notifications: [],
      users: [
        {
          id: "admin-1",
          name: "John Errol Arellano",
          email: "john.arellano@helloconnect.org",
          role: "ADMIN",
          position: "IT Administrator",
          password: "password123" // Simple password for now
        }
      ]
    }));
  }

  const generateId = () => {
    return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  };

  const getDB = () => {
    const db = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    if (!db.users) db.users = [];
    if (!db.notifications) db.notifications = [];
    return db;
  };
  const saveDB = (db: any) => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

  // API Routes
  app.get("/api/auth/me", (req, res) => {
    const session = req.cookies.user_session;
    if (session) {
      try {
        res.json(JSON.parse(session));
      } catch {
        res.status(401).json({ error: "Invalid session" });
      }
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  });

  app.get("/api/auth/logout", (req, res) => {
    res.clearCookie("user_session", {
      secure: true,
      sameSite: "none",
      httpOnly: true
    });
    res.json({ status: "ok" });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const db = getDB();
    const user = db.users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      position: user.position || (user.role === 'ADMIN' ? 'IT Administrator' : 'IT Personnel'),
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4A773C&color=fff`
    };

    res.cookie("user_session", JSON.stringify(sessionUser), {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
    });
    res.json(sessionUser);
  });

  app.get("/api/users", (req, res) => {
    const db = getDB();
    // Return users without passwords for listing, but admin might need to see them for editing
    // Actually, never send passwords back. Just send a flag if they have one or allow setting a new one.
    res.json(db.users.map(({ password, ...u }: any) => u));
  });

  app.put("/api/users/:id", (req, res) => {
    const session = req.cookies.user_session;
    if (!session) return res.status(401).json({ error: "Unauthorized" });
    
    const sessionData = JSON.parse(session);
    const db = getDB();
    const targetId = req.params.id;
    
    // Check if requester is admin or the user themselves
    if (sessionData.role !== 'ADMIN' && sessionData.id !== targetId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const userIndex = db.users.findIndex((u: any) => u.id === targetId);
    if (userIndex === -1) return res.status(404).json({ error: "User not found" });

    const { name, email, position, password, role } = req.body;
    
    const existingUser = db.users[userIndex];
    
    // Only admins can change roles
    const updatedRole = sessionData.role === 'ADMIN' ? (role ?? existingUser.role) : existingUser.role;

    db.users[userIndex] = {
      ...existingUser,
      name: name ?? existingUser.name,
      email: email ?? existingUser.email,
      position: position ?? existingUser.position,
      role: updatedRole,
    };

    if (password) {
      db.users[userIndex].password = password;
    }

    saveDB(db);

    // If updating self, update session cookie
    if (sessionData.id === targetId) {
      const updatedSession = { 
        ...sessionData, 
        name: db.users[userIndex].name, 
        email: db.users[userIndex].email, 
        position: db.users[userIndex].position,
        role: db.users[userIndex].role
      };
      res.cookie("user_session", JSON.stringify(updatedSession), {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      return res.json(updatedSession);
    }

    const { password: _, ...safeUser } = db.users[userIndex];
    res.json(safeUser);
  });

  app.post("/api/users", (req, res) => {
    const db = getDB();
    const newUser = {
      id: generateId(),
      ...req.body
    };
    
    // Check for duplicate emails or IDs
    if (db.users.some((u: any) => u.email === newUser.email)) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    db.users.push(newUser);
    saveDB(db);
    const { password, ...safeUser } = newUser;
    res.json(safeUser);
  });

  app.delete("/api/users/:id", (req, res) => {
    const session = req.cookies.user_session;
    if (!session) return res.status(401).json({ error: "Unauthorized" });
    const sessionData = JSON.parse(session);
    
    // Only admins can delete users
    if (sessionData.role !== 'ADMIN') {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { id } = req.params;
    const db = getDB();
    const initialCount = db.users.length;
    db.users = db.users.filter((u: any) => String(u.id) !== String(id));
    
    if (db.users.length === initialCount) {
      return res.status(404).json({ error: "User not found" });
    }

    saveDB(db);
    res.json({ status: "ok" });
  });
  app.get("/api/handovers", (req, res) => {
    const db = getDB();
    res.json(db.handovers || []);
  });

  app.post("/api/handovers", (req, res) => {
    const db = getDB();
    const newHandover = {
      ...req.body,
      id: generateId() // Ensure server-side ID for uniqueness
    };
    db.handovers.push(newHandover);

    // Create notification
    const notification = {
      id: generateId(),
      type: 'handover',
      title: 'New Endorsement Matrix',
      message: `${newHandover.fromShift} to ${newHandover.toShift} Shift Endorsement`,
      timestamp: Date.now(),
      readBy: [],
      assignedToUserIds: Array.isArray(newHandover.endorsedTo) ? newHandover.endorsedTo : (newHandover.endorsedTo ? [newHandover.endorsedTo] : []),
      linkView: 'handover'
    };
    db.notifications.push(notification);

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
    const oldTasksCount = (db.tasks || []).length;
    
    // Identify new tasks for notifications
    if (Array.isArray(newTasks) && newTasks.length > oldTasksCount) {
      const addedTasks = newTasks.filter(t => !db.tasks.find((ot: any) => ot.id === t.id));
      addedTasks.forEach(t => {
        db.notifications.push({
          id: generateId(),
          type: 'task',
          title: 'New Task Assigned',
          message: `${t.title}`,
          timestamp: Date.now(),
          readBy: [],
          assignedToUserIds: Array.isArray(t.assignedTo) ? t.assignedTo : (t.assignedTo ? [t.assignedTo] : []),
          linkView: 'tasks'
        });
      });
    }

    db.tasks = newTasks; 
    saveDB(db);
    res.json({ status: "ok" });
  });

  app.get("/api/notifications", (req, res) => {
    const db = getDB();
    // Sort by newest first
    const sorted = [...(db.notifications || [])].sort((a, b) => b.timestamp - a.timestamp);
    res.json(sorted.slice(0, 50)); // Return last 50
  });

  app.post("/api/notifications/read", (req, res) => {
    const session = req.cookies.user_session;
    if (!session) return res.status(401).json({ error: "Unauthorized" });
    const sessionData = JSON.parse(session);
    
    const db = getDB();
    const { notificationId } = req.body;
    
    if (notificationId === 'all') {
      db.notifications.forEach((n: any) => {
        if (!n.readBy.includes(sessionData.id)) {
          n.readBy.push(sessionData.id);
        }
      });
    } else {
      const notification = db.notifications.find((n: any) => n.id === notificationId);
      if (notification && !notification.readBy.includes(sessionData.id)) {
        notification.readBy.push(sessionData.id);
      }
    }
    
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
