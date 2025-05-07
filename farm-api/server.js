// changed type to "modeule" in package.json, so we need to use "import" instead of require()
import express from "express";
import cors from "cors";
import { db } from "./db.js";

const app = express();  // Now define 'app' after imports

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Farm Management API is running...");
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

// POST /fields to create a new field
app.post("/fields", async (req, res) => {
  const { name, crop_type, account_id } = req.body;  // Use 'name' instead of 'field_name'

  if (!name || !account_id) {
    return res.status(400).json({ error: "Missing required field info" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO Fields (name, crop_type, account_id) VALUES (?, ?, ?)",  // Use 'name' here
      [name, crop_type || null, account_id]
    );

    console.log("✅ New field created:", result.insertId);
    res.json({ id: result.insertId });
  } catch (err) {
    console.error("❌ Failed to insert field:", err.message);
    res.status(500).json({ error: "Failed to insert field" });
  }
});

app.delete("/fields/:id", async (req, res) => {
  const { id } = req.params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return res.status(400).json({ error: "Invalid field ID" });
  }

  try {
    const [result] = await db.query("DELETE FROM Fields WHERE Field_ID = ?", [numericId]);
    console.log("🧪 Deletion result:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `Field ID ${numericId} not found in Railway database` });
    }

    console.log(`✅ Field ID ${numericId} deleted from Railway DB`);
    res.json({ message: `Field ID ${numericId} deleted successfully` });
  } catch (err) {
    console.error("❌ Error deleting field from Railway DB:", err.message);
    res.status(500).json({ error: "Failed to delete field from Railway DB" });
  }
});




// GET all tasks (with optional filtering by status)
app.get("/tasks", async (req, res) => {
  const { status } = req.query;  // extracts 'status' from query params if patched

  try {
    // builds the query based on whether the 'status' is provided
    let query = "SELECT * FROM Tasks";
    let queryParams = [];

    if (status) {
      query += " WHERE Status = ?";
      queryParams.push(status); 
    }
    // runs the query with dynamic parameters
    const [tasks] = await db.query(query, queryParams);

    // returns tasks as a JSON response
    res.json(tasks);

    // error handling
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: err.message });
  }
});

// create new task
app.post("/tasks", async (req, res) => {

  // initialises the vars
  const { account_id, Task_name, Field_ID, Required_Skills, Num_of_workers, Worker_type, Task_Time } = req.body;

  // inserts the inputted values into the tables column slots
  try {
    const [result] = await db.query(
      "INSERT INTO Tasks (account_id, Task_name, Field_ID, Required_Skills, Num_of_workers, Worker_type, Task_Time) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [account_id, Task_name, Field_ID, Required_Skills, Num_of_workers, Worker_type, Task_Time]
    );

    // inserts the inputted data from Wix
    res.json({ id: result.insertId, Task_name, Field_ID, Required_Skills, Num_of_workers, Worker_type, Task_Time });

    // error handling
  } catch (err) {
    console.error("Database Insert Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// updates the task status using the task ID
app.patch("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { Status } = req.body;

  // uses the UPDATE query to update the task's status
  try {
    const [result] = await db.query("UPDATE Tasks SET Status = ? WHERE Task_ID = ?", [Status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task updated successfully" });

    // error handling
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETEs all tasks from the tasks table
app.delete("/tasks", async (req, res) => {
  try {
    await db.query("DELETE FROM Tasks");
    await db.query("ALTER TABLE Tasks AUTO_INCREMENT = 1");
    console.log("✅ Tasks table cleared via API.");
    res.status(200).json({ message: "Tasks table cleared." });
  } catch (err) {
    console.error("❌ Failed to clear Tasks table:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// creates new worker
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

// login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("🛂 Login attempt with email:", email);

  try {
    const [rows] = await db.query("SELECT * FROM accounts WHERE email = ?", [email]);
    console.log("🔍 Query result:", rows);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "This email doesn't match any account. Try again." });
    }

    const user = rows[0];

  if (password !== user.password_hash) {
    return res.status(401).json({ success: false, message: "Invalid password" });
  }

    res.json({ success: true, account_id: user.account_id, account_type: user.account_type });
  } catch (err) {
    console.error("❌ DB error during login:", err);
    res.status(500).json({ error: err.message });
  }
});


// logic for clearing the tasks table on every server restart
async function clearTasksTable() {
  try {
    await db.query("DELETE FROM Tasks");
    await db.query("ALTER TABLE Tasks AUTO_INCREMENT = 1"); // sets the auto-increment back to 1 after each commit
    console.log("✅ Tasks table cleared on deployment.");
  } catch (err) {
    console.error("❌ Failed to clear Tasks table:", err.message);
  }
}

// clears the data in the tasks table every time we commit changes
//clearTasksTable();

// start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
