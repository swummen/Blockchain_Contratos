import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { Role, VALID_ROLES } from "../repositories/userRepository";
import { createUser, deactivateUser, listUsers, updateUser } from "../services/userService";

export const usersRouter = Router();

function parseUserInput(body: unknown): { name: string; email: string; role: Role } | null {
  const { name, email, role } = (body ?? {}) as Record<string, unknown>;
  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof role !== "string" ||
    !VALID_ROLES.includes(role as Role)
  ) {
    return null;
  }
  return { name: name.trim(), email: email.trim(), role: role as Role };
}

const INVALID_INPUT_MESSAGE = "name, email y role (Empleado|Verificador|Administrador) son obligatorios.";

usersRouter.get("/users", requireAuth("Administrador"), async (_req, res) => {
  res.status(200).json(await listUsers());
});

usersRouter.post("/users", requireAuth("Administrador"), async (req, res) => {
  const input = parseUserInput(req.body);
  if (!input) {
    res.status(400).json({ message: INVALID_INPUT_MESSAGE });
    return;
  }

  const result = await createUser(input);
  if (!result.ok) {
    res.status(result.status).json({ message: result.message });
    return;
  }
  res.status(201).json({ user: result.user, temporaryPassword: result.temporaryPassword });
});

usersRouter.put("/users/:id", requireAuth("Administrador"), async (req, res) => {
  const input = parseUserInput(req.body);
  if (!input) {
    res.status(400).json({ message: INVALID_INPUT_MESSAGE });
    return;
  }

  // Quitarse el propio rol dejaría al Administrador sin forma de revertirlo.
  if (req.params.id === req.user?.sub && input.role !== "Administrador") {
    res.status(400).json({ message: "No puedes cambiar tu propio rol." });
    return;
  }

  const result = await updateUser(req.params.id as string, input);
  if (!result.ok) {
    res.status(result.status).json({ message: result.message });
    return;
  }
  res.status(200).json({ user: result.user });
});

usersRouter.post("/users/:id/deactivate", requireAuth("Administrador"), async (req, res) => {
  // No existe la reactivación: desactivarse a sí mismo sería irreversible.
  if (req.params.id === req.user?.sub) {
    res.status(400).json({ message: "No puedes desactivar tu propia cuenta." });
    return;
  }

  const result = await deactivateUser(req.params.id as string);
  if (!result.ok) {
    res.status(result.status).json({ message: result.message });
    return;
  }
  res.status(204).send();
});
