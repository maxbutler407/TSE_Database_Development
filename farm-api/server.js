const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Farm Management API is running...");
});

// get all Fields
app.get("/fields", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Fields");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
