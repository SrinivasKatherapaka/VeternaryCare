import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../services/dbService.js';
import { AuthLoginSchema } from '../shared/validators.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-vet-compliance-key-2026-secure-jwt';

export async function login(req: Request, res: Response) {
  try {
    const result = AuthLoginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, error: 'Invalid login parameters', details: result.error.errors });
    }

    const { email } = result.data;
    const user = await db.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or user is inactive.' });
    }

    await db.updateLastLogin(user.id);

    const payload = {
      id: user.id,
      tenant_id: user.tenant_id,
      email: user.email,
      full_name: user.full_name,
      title: user.title,
      role: user.role,
      license_number: user.license_number
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    const tenant = {
      id: user.tenant_id,
      name: user.tenant_name,
      license_number: user.tenant_license,
      dea_registration_number: user.dea_registration_number,
      state_board_license: user.state_board_license,
      accreditation: user.accreditation
    };

    return res.json({
      success: true,
      token,
      user: payload,
      tenant
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
