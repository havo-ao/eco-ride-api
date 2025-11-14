export function accountActivationTemplate(token: string) {
  const frontendUrl = 'http://localhost:5173'; // tu URL local o la real en producción

  return `
    <h1>Bienvenido a EcoRide</h1>
    <p>Haz clic en el siguiente enlace para activar tu cuenta:</p>
    <a href="${frontendUrl}/activate/${token}" target="_blank" style="color:#1a73e8;">
      Activar cuenta
    </a>
    <p>Este enlace expira en 24 horas.</p>
  `;
}