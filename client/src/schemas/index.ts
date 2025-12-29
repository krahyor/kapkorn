import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'กรุณากรอกชื่อผู้ใช้'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'กรุณายอมรับนโยบายความเป็นส่วนตัว',
  }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
