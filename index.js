const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

console.log("🔄 Starting MCP backend...");

dotenv.config();

const app = express();
const routes = require("./protocol/route");

// ✅ Middleware
app.use(express.json());
app.use(cors());

// ✅ Route
app.use("/api", routes);

// ✅ Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
