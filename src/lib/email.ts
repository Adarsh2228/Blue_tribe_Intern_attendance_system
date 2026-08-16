import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Attendance System <onboarding@resend.dev>'

export async function sendOTPEmail(to: string, otp: string): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: '🔐 Your Admin Login OTP — Attendance System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);border-radius:16px;border:1px solid #334155;overflow:hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px;text-align:center;">
                      <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:24px;">🏢</div>
                      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Employee Attendance System</h1>
                      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Admin Authentication</p>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 32px;">
                      <h2 style="color:#f1f5f9;margin:0 0 8px;font-size:18px;font-weight:600;">Your One-Time Password</h2>
                      <p style="color:#94a3b8;margin:0 0 28px;font-size:14px;line-height:1.6;">
                        Use the code below to complete your admin login. This OTP is valid for <strong style="color:#a78bfa;">10 minutes</strong> and can only be used once.
                      </p>
                      <!-- OTP Box -->
                      <div style="background:#1e293b;border:2px solid #6366f1;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                        <p style="color:#94a3b8;margin:0 0 12px;font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">One-Time Password</p>
                        <div style="font-size:42px;font-weight:800;letter-spacing:12px;color:#a78bfa;font-family:monospace;">${otp}</div>
                      </div>
                      <div style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:16px;margin-bottom:24px;">
                        <p style="color:#f59e0b;margin:0;font-size:13px;line-height:1.6;">
                          ⚠️ <strong>Security Notice:</strong> Never share this OTP with anyone. Our team will never ask for this code. If you did not request this, please ignore this email.
                        </p>
                      </div>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="border-top:1px solid #334155;padding:20px 32px;text-align:center;">
                      <p style="color:#475569;margin:0;font-size:12px;">
                        This email was sent to <strong style="color:#94a3b8;">${to}</strong><br/>
                        Employee Attendance Management System
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('Email send failed:', err)
    return false
  }
}
