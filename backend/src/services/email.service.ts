import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    // Verifica la conexión al arrancar
    await transporter.verify();
    console.log(`📧 SMTP listo: ${process.env.SMTP_HOST}`);
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('📧 Email dev mode (Ethereal)');
  }

  return transporter;
}

export async function sendVerificationEmail(to: string, firstName: string, token: string) {
  const appUrl = process.env.APP_URL || 'http://localhost';
  const verifyUrl = `${appUrl}/api/auth/verify/${token}`;
  const from = process.env.SMTP_FROM || 'noreply@padelnet.app';

  const transport = await getTransporter();

  const info = await transport.sendMail({
    from: `"PadelNet ⚡" <${from}>`,
    to,
    subject: '⚡ Verifica tu cuenta en PadelNet',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#1a1d27;color:#e8eaf6;padding:32px;border-radius:12px">
        <h1 style="color:#4f8ef7;margin-bottom:4px">⚡ PadelNet</h1>
        <p style="color:#8892b0;margin-top:0;margin-bottom:24px">Liga de pádel online</p>
        <h2 style="font-size:20px;margin-bottom:12px">¡Hola, ${firstName}!</h2>
        <p style="line-height:1.6;color:#c8cadc">
          Gracias por registrarte en PadelNet. Para activar tu cuenta, haz clic en el botón de abajo.
        </p>
        <a href="${verifyUrl}"
           style="display:inline-block;margin:20px 0;background:#4f8ef7;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px">
          Verificar mi cuenta
        </a>
        <p style="font-size:12px;color:#8892b0;margin-top:24px">
          Si no te registraste en PadelNet, ignora este correo.<br>
          El enlace expira en 24 horas.
        </p>
        <hr style="border:none;border-top:1px solid #2e3250;margin:20px 0">
        <p style="font-size:11px;color:#8892b0">
          Si el botón no funciona, copia este enlace:<br>
          <span style="color:#4f8ef7">${verifyUrl}</span>
        </p>
      </div>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`📧 Preview: ${previewUrl}`);
  } else {
    console.log(`📧 Email enviado a ${to} (messageId: ${info.messageId})`);
  }

  return info;
}
