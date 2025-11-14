import { Request, Response } from 'express';
import { db } from '../../../core/database/mysql';

export async function debugUserRidesController(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'INVALID_USER_ID' });

  try {
    const sql = `SELECT * FROM ride WHERE user_id = ? ORDER BY end_time DESC LIMIT 50`;
    const [rows] = await db.query(sql, [id]);
    return res.status(200).json({ count: Array.isArray(rows) ? rows.length : 0, rows });
  } catch (err) {
    return res.status(500).json({ message: 'ERROR_INTERNAL', error: (err as any)?.message });
  }
}
