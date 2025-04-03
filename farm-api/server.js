// changed type to "modeule" in package.json, so we need to use "import" instead of require()
import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();  // Now define 'app' after imports

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Farm Management API is running...");
});

// *** Front-end Development ***
import { greet } from "./index.js"; // Use import instead of require

app.get("/users", async (req, res) => {
  try {
    console.log(greet("Max"));
    res.json({ message: greet("Max") });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



// *** Database Development***
// get all Fields
app.get("/fields", async (req, res) => {
  try {
    const [fields] = await db.query("SELECT * FROM Fields");
    res.json(fields);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get all tasks
app.get("/tasks", async (req, res) => {
  try {
    const [tasks] = await db.query("SELECT * FROM Tasks");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// create new task
app.post("/tasks", async (req, res) => {
  const { Task_name, Field_ID, Required_Skills, Num_of_workers, Task_Time } = req.body;

    // check if account_id is provided for debugging
  if (!account_id) {
    return res.status(400).json({ error: "account_id is required" });
    
  try {
    const [result] = await db.query(
      "INSERT INTO Tasks (Task_name, Field_ID, Required_Skills, Num_of_workers, Task_Time) VALUES (?, ?, ?, ?, ?)",
      [Task_name, Field_ID, Required_Skills, Num_of_workers, Task_Time]
    );
    res.json({ id: result.insertId, Task_name, Field_ID, Required_Skills, Num_of_workers, Task_Time });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// create new worker
// get tasks os specific field
app.get("/fields/:id/tasks", async (req, res) => {
  const { id } = req.params;
  try {
    const [tasks] = await db.query("SELECT * FROM Tasks WHERE Field_ID = ?", [id]);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// assign worker to the task
app.post("/assign-task", async (req, res) => {
  const { Worker_ID, Task_ID } = req.body;
  try {
    await db.query("UPDATE Workers SET current_task_id = ? WHERE Worker_ID = ?", [Task_ID, Worker_ID]);
    res.json({ message: "Task assigned successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
