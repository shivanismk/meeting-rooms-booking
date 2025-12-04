import { pool } from "../db.js";

export async function createRoom(req, res) {
  const { name, capacity } = req.body;
  try {
    await pool.query(
      "INSERT INTO rooms (name, capacity) VALUES ($1,$2)",
      [name, capacity]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.detail });
  }
}

export async function getRooms(req, res) {
  const result = await pool.query("SELECT * FROM rooms");
  res.json(result.rows);
}
