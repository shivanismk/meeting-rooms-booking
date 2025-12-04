import { pool } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function register(req, res) {
  const { name, email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4)",
      [name, email, hash, role || "user"]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.detail });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  if (!result.rows.length) return res.status(400).json({ error: "User not found" });

  const user = result.rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);

  if (!ok) return res.status(400).json({ error: "Wrong password" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET
  );

  res.json({ token, role: user.role });
}
