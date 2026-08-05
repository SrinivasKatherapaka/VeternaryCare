import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { mockDb } from '../services/mockDb.js';

export function getUsers(req: AuthRequest, res: Response) {
  const users = mockDb.users.map(u => ({
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    role: u.role,
    is_active: u.is_active,
    last_login_at: u.last_login_at
  }));

  return res.json({ success: true, users });
}

export function updateUserRole(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { role, is_active } = req.body;

  const user = mockDb.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  if (role) user.role = role;
  if (is_active !== undefined) user.is_active = is_active;

  return res.json({ success: true, user });
}
