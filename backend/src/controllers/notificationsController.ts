import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { mockDb } from '../services/mockDb.js';

export function getNotifications(req: AuthRequest, res: Response) {
  return res.json({ success: true, notifications: mockDb.notifications });
}

export function markNotificationRead(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const notif = mockDb.notifications.find(n => n.id === id);
  if (notif) {
    notif.is_read = true;
  }
  return res.json({ success: true, notification: notif });
}
