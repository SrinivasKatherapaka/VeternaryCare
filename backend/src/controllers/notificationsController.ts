import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { db } from '../services/dbService.js';

export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    const tenantId = req.user!.tenant_id;
    const notifications = await db.getNotifications(tenantId);
    return res.json({ success: true, notifications });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function markNotificationRead(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const updated = await db.markNotificationRead(id);
    return res.json({ success: true, notification: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function createNotification(req: AuthRequest, res: Response) {
  try {
    const tenantId = req.user!.tenant_id;
    const newNotification = await db.createNotification({
      ...req.body,
      tenant_id: tenantId
    });
    return res.status(201).json({ success: true, notification: newNotification });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
