// Secretos/config que src/config/*.ts exige sin default (por diseño — ver
// config/auth.ts). Solo para que los tests puedan importar src/server.ts;
// nunca un valor real, y nunca se usa fuera de este proceso de test.
process.env.JWT_SECRET ??= "test-secret-nunca-usar-en-produccion";
