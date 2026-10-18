import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  changePassword,
  getPublicUserById,
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

// Usuario de la sesión activa (cualquier rol).
authRouter.get("/auth/me", requireAuth(), async (req, res) => {
  const user = await getPublicUserById(req.user!.sub);
  if (!user) {
    res.status(401).json({ message: "Sesión inválida o vencida." });
    return;
  }
  res.status(200).json({ user });
});

authRouter.post("/auth/logout", requireAuth(), async (req, res) => {
  await logout(req.user!.jti);
  res.status(204).send();
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
