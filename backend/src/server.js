import app from "./app.js";
import { pool } from "./db.js";

const PORT = 5000;

(async () => {
  try {
    await pool.connect();
    console.log("PostgreSQL Connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (e) {
    console.error("DB connection failed:", e);
  }
})();
