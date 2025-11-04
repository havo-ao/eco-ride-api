import { Request, Response } from 'express';
import { startRide } from '../repositories/ride.repo';

export async function startRideController(req: Request, res: Response) {
  const dto = req.body;

  try {
    const result = await startRide(dto);

    if (result.status === 'OK') {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (err) {
    return res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
  }
}