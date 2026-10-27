import { Router } from "express";
import { requireAuth, requireSession } from "../middlewares/auth";
import {
  acceptPolicy,
  changePassword,
  getSessionUserById,
  login,
  logout,
  verifyOtp,
} from "../services/authService";

export const authRouter = Router();

authRouter.post("/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    res.status(400).json({
      message: "email y password son obligatorios.",
    });
    return;
  }

  const result = await login(email, password);
  if (!result.ok) {
    res.status(result.status).json({ message: result.message });
    return;
  }
  res.status(200).json({ message: "Código de verificación enviado." });
});

authRouter.post("/auth/verify-otp", async (req, res) => {
  const { email, code } = req.body ?? {};

  if (typeof email !== "string" || !email.trim() || typeof code !== "string" || !code) {
    res.status(400).json({ message: "email y code son obligatorios." });
    return;
  }

  const result = await verifyOtp(email, code);
  if (!result.ok) {
    res.status(result.status).json({ message: result.message });
    return;
  }
  res.status(200).json({ token: result.token, user: result.user });
});

// Usuario de la sesión activa (cualquier rol). No exige la política: la pantalla
// de la política la usa para saber si ya fue aceptada.
authRouter.get("/auth/me", requireSession(), async (req, res) => {
  const user = await getSessionUserById(req.user!.sub);
  if (!user) {
    res.status(401).json({ message: "Sesión inválida o vencida." });
    return;
  }
  res.status(200).json({ user });
});

// Sin la política aceptada también se puede salir ("Rechazar y salir").
authRouter.post("/auth/logout", requireSession(), async (req, res) => {
  await logout(req.user!.jti);
  res.status(204).send();
});

// RF-055: aceptación de la política de tratamiento de datos.
authRouter.post("/auth/accept-policy", requireSession(), async (req, res) => {
  const { version } = req.body ?? {};
  if (typeof version !== "string" || !version.trim()) {
    res.status(400).json({ message: "version es obligatoria." });
    return;
  }

  // Usuario y sesión salen del JWT, nunca del body.
  const result = await acceptPolicy(req.user!.sub, req.user!.jti, version);
  if (!result.ok) {
    res.status(result.status).json({ message: result.message });
    return;
  }
  res.status(200).json({ user: result.user });
});

authRouter.post("/auth/change-password", requireAuth(), async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};

  if (
    typeof currentPassword !== "string" ||
    !currentPassword ||
    typeof newPassword !== "string" ||
    !newPassword
  ) {
    res
      .status(400)
      .json({ message: "currentPassword y newPassword son obligatorios." });
    return;
  }

  // El id sale del JWT, nunca del body: no se puede cambiar la contraseña de otro.
  const result = await changePassword(req.user!.sub, currentPassword, newPassword);
  if (!result.ok) {
    res.status(result.status).json({ message: result.message });
    return;
  }
  res.status(200).json({ message: "Contraseña actualizada." });
});
