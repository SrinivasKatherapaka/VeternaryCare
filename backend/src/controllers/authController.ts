import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { mockDb } from '../services/mockDb.js';
import { AuthLoginSchema } from '../shared/validators.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-vet-compliance-key-2026-secure-jwt';

export function login(req: Request, res: Response) {
  const result = AuthLoginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: 'Invalid login parameters', details: result.error.errors });
  }

  const { email } = result.data;
  const user = mockDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  user.last_login_at = new Date().toISOString();
  const tenant = mockDb.tenants.find(t => t.id === user.tenant_id);

  const payload = {
    id: user.id,
    tenant_id: user.tenant_id,
    email: user.email,
    full_name: user.full_name,
    role: user.role
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

  return res.json({
    success: true,
    token,
    user: payload,
    tenant
  });
}
