// RF-055 / Ley 1581 de 2012. Al cambiar este texto hay que subir la versión
// aquí y en backend/src/config/auth.ts (policyVersion): todos la aceptan de nuevo.
export const POLICY_VERSION = "1.0"
export const POLICY_EFFECTIVE_DATE = "27 de octubre de 2026"

export interface PolicySection {
  title: string
  paragraphs: string[]
}

export const POLICY_SECTIONS: PolicySection[] = [
  {
    title: "1. Responsable del tratamiento",
    paragraphs: [
      "TrazaDoc es un sistema para verificar la integridad y la trazabilidad de contratos laborales, desarrollado como trabajo de grado del programa de Ingeniería de Sistemas y Computación de la Universidad Católica de Colombia. Contacto para cualquier asunto sobre tus datos: contratosblockchain@gmail.com.",
    ],
  },
  {
    title: "2. Datos que se tratan",
    paragraphs: [
      "Nombre, correo electrónico corporativo y rol en el sistema.",
      "Contraseña: solo se guarda una huella con sal (bcrypt), nunca el texto de la contraseña.",
      "Códigos de verificación de un solo uso, que vencen a los 5 minutos.",
      "Registros de acceso: sesiones e intentos fallidos de inicio de sesión (correo ingresado, fecha, hora y motivo, nunca la contraseña).",
      "De cada documento: nombre del archivo, responsable, fecha de registro, estado y su huella SHA-256. El contenido del PDF no se guarda.",
    ],
  },
  {
    title: "3. Para qué se usan",
    paragraphs: [
      "Autenticar a los usuarios y controlar qué puede hacer cada rol.",
      "Registrar los documentos y verificar que no hayan sido alterados.",
      "Mantener el historial de acciones sobre cada documento (trazabilidad y auditoría).",
      "Proteger las cuentas: bloquear accesos tras varios intentos fallidos y detectar accesos sospechosos.",
    ],
  },
  {
    title: "4. Datos en la red blockchain",
    paragraphs: [
      "En la red blockchain solo se guardan la huella del documento, su estado y los eventos (acción, fecha e identificador interno del usuario). No se guardan nombres ni correos. Por la naturaleza de la blockchain, estos registros no se pueden modificar ni borrar; por eso no contienen datos personales directos.",
    ],
  },
  {
    title: "5. Encargados del tratamiento",
    paragraphs: [
      "Brevo, para enviar el código de verificación a tu correo.",
      "Microsoft Azure, donde funciona el servidor del sistema.",
    ],
  },
  {
    title: "6. Tus derechos (artículo 8 de la Ley 1581 de 2012)",
    paragraphs: [
      "Conocer, actualizar y rectificar tus datos.",
      "Pedir prueba de esta autorización.",
      "Saber cómo se han usado tus datos.",
      "Presentar quejas ante la Superintendencia de Industria y Comercio.",
      "Revocar la autorización o pedir que se borren tus datos, cuando no exista un deber legal o contractual de conservarlos.",
      "Acceder a tus datos sin costo.",
    ],
  },
  {
    title: "7. Cómo ejercer tus derechos",
    paragraphs: [
      "Escribe a contratosblockchain@gmail.com. Las consultas se responden en máximo 10 días hábiles y los reclamos en máximo 15 días hábiles (artículos 14 y 15 de la Ley 1581 de 2012).",
    ],
  },
  {
    title: "8. Seguridad",
    paragraphs: [
      "Conexión cifrada (HTTPS), contraseñas guardadas como huella con sal, doble factor de autenticación por correo y acceso según el rol de cada usuario.",
    ],
  },
  {
    title: "9. Conservación",
    paragraphs: [
      "Los intentos fallidos de inicio de sesión se borran a los 90 días. Los demás datos se conservan mientras tu cuenta exista o lo exija la ley. Si tu cuenta se desactiva, el historial de los documentos se conserva para no perder la trazabilidad.",
    ],
  },
  {
    title: "10. Cambios a esta política",
    paragraphs: [
      "Si esta política cambia, se publicará una nueva versión y se te pedirá aceptarla de nuevo antes de seguir usando el sistema.",
    ],
  },
]
