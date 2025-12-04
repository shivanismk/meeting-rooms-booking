import { pool } from "../db.js";

function withinWorkingHours(start, end) {
  return start >= "09:00" && end <= "18:00";
}

// CREATE BOOKING
export async function createBooking(req, res) {
  const userId = req.user.id;
  const { date, start_time, end_time } = req.body;

  if (!withinWorkingHours(start_time, end_time))
    return res.status(400).json({ error: "Outside working hours" });

  const rooms = await pool.query(
    "SELECT * FROM rooms WHERE is_active=true"
  );

  let freeRooms = [];

  for (let room of rooms.rows) {
    const conflicts = await pool.query(
      `SELECT * FROM bookings
       WHERE room_id=$1 AND date=$2
       AND NOT (end_time <= $3 OR $4 <= start_time)`,
      [room.id, date, start_time, end_time]
    );

    if (conflicts.rows.length === 0) freeRooms.push(room);
  }

  if (!freeRooms.length)
    return res.status(400).json({ error: "No available rooms for this time slot" });

  // pick room with least booked time that day
  let bestRoom = freeRooms[0];
  let bestLoad = Infinity;

  for (let r of freeRooms) {
    const sum = await pool.query(
      `SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time)))/60,0) AS total
       FROM bookings WHERE room_id=$1 AND date=$2`,
      [r.id, date]
    );
    let load = sum.rows[0].total;
    if (load < bestLoad) {
      bestLoad = load;
      bestRoom = r;
    }
  }

  // Insert booking
  await pool.query(
    "INSERT INTO bookings (user_id, room_id, date, start_time, end_time) VALUES ($1,$2,$3,$4,$5)",
    [userId, bestRoom.id, date, start_time, end_time]
  );

  res.json({ success: true, room: bestRoom.name });
}

export async function getMyBookings(req, res) {
  const result = await pool.query(
    "SELECT * FROM bookings WHERE user_id=$1 ORDER BY date ASC",
    [req.user.id]
  );
  res.json(result.rows);
}

export async function deleteBooking(req, res) {
  await pool.query("DELETE FROM bookings WHERE id=$1 AND user_id=$2", [
    req.params.id,
    req.user.id,
  ]);
  res.json({ success: true });
}

export async function adminGetAllBookings(req, res) {
  const result = await pool.query("SELECT * FROM bookings ORDER BY date ASC");
  res.json(result.rows);
}
