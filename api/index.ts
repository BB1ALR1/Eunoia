import express, { type Request, Response, NextFunction } from "express";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple in-memory user store for testing (replace with database later)
const users = new Map();
const sessions = new Map();

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    message: "Serverless function is working"
  });
});

// Signup endpoint
app.post("/api/auth/signup", async (req, res) => {
  try {
    console.log("Signup attempt:", req.body);
    
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // Check if username or email already exists
    for (const [id, user] of users) {
      if (user.username === username) {
        return res.status(400).json({ message: "Username already exists" });
      }
      if (user.email === email) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Create user (simple hash for demo)
    const userId = Date.now().toString();
    const hashedPassword = Buffer.from(password).toString('base64'); // Simple encoding for demo
    
    users.set(userId, {
      id: userId,
      username,
      email,
      password: hashedPassword
    });

    // Create session token
    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessions.set(sessionToken, {
      userId,
      username,
      email
    });

    console.log("User created successfully:", userId);

    res.json({ 
      id: userId, 
      username,
      email,
      token: sessionToken,
      message: "Account created successfully" 
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Failed to create account", error: error.message });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("Login attempt:", req.body);
    
    const { usernameOrEmail, password } = req.body;
    
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ message: "Username/email and password are required" });
    }

    // Find user by username or email
    let foundUser = null;
    for (const [id, user] of users) {
      if (user.username === usernameOrEmail || user.email === usernameOrEmail) {
        foundUser = user;
        break;
      }
    }
    
    if (!foundUser) {
      return res.status(401).json({ message: "Invalid username/email or password" });
    }

    // Check password (simple comparison for demo)
    const hashedPassword = Buffer.from(password).toString('base64');
    if (foundUser.password !== hashedPassword) {
      return res.status(401).json({ message: "Invalid username/email or password" });
    }

    // Create session token
    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessions.set(sessionToken, {
      userId: foundUser.id,
      username: foundUser.username,
      email: foundUser.email
    });

    console.log("User logged in successfully:", foundUser.id);

    res.json({ 
      id: foundUser.id, 
      username: foundUser.username,
      email: foundUser.email,
      token: sessionToken,
      message: "Logged in successfully" 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to log in", error: error.message });
  }
});

// Logout endpoint
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    sessions.delete(token);
  }
  res.json({ message: "Logged out successfully" });
});

// User profile endpoint
app.get("/api/user/profile", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const token = authHeader.substring(7);
  const sessionData = sessions.get(token);
  
  if (!sessionData) {
    return res.status(401).json({ message: "Invalid token" });
  }
  
  res.json({
    id: sessionData.userId,
    username: sessionData.username,
    email: sessionData.email
  });
});

// Error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Serverless function error:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message, error: err.message });
});

// Export the Express app for Vercel
export default app;
