// RF-055 / HU-023: política de tratamiento de datos personales (Ley 1581/2012).
// POLICY_VERSION debe coincidir con CURRENT_POLICY_VERSION del backend
// (backend/src/config/policy.ts): si cambia el texto, se suben las dos y todos
// los usuarios vuelven a aceptarla.
export const POLICY_VERSION = "1.0"
// Se muestra como "vigente desde el mes de <POLICY_DATE>".
export const POLICY_DATE = "octubre de 2026"
export const POLICY_CONTACT_EMAIL = "contratosblockchain@gmail.com"

export interface PolicySection {
  title: string
  paragraphs?: string[]
  items?: string[]
}

export const POLICY_SECTIONS: PolicySection[] = [
  {
    title: "1. Responsable del tratamiento",
    paragraphs: [
      "La organización que administra TrazaDoc es responsable del tratamiento de los datos personales de quienes usan la plataforma, en los términos de la Ley 1581 de 2012 y sus decretos reglamentarios.",
      `Canal de atención: ${POLICY_CONTACT_EMAIL}.`,
    ],
  },
  {
    title: "2. Datos que se recolectan",
    items: [
      "Datos de identificación y contacto: nombre y correo electrónico.",
      "Datos de la cuenta: rol asignado y contraseña, que se guarda cifrada y nunca en texto plano.",
      "Datos de uso: fecha y hora de los inicios de sesión, intentos fallidos y acciones realizadas sobre los documentos (carga y verificación).",
    ],
    paragraphs: [
      "TrazaDoc no guarda el contenido de los documentos: solo su huella criptográfica SHA-256 y metadatos mínimos (nombre del archivo, tamaño, fecha y responsable).",
    ],
  },
  {
    title: "3. Finalidades",
    items: [
      "Verificar la identidad de quien ingresa, incluido el envío del código de verificación al correo registrado.",
      "Controlar el acceso a cada funcionalidad según el rol.",
      "Registrar la trazabilidad de las acciones sobre los documentos como evidencia de su integridad.",
      "Atender consultas, reclamos y solicitudes de los titulares.",
    ],
  },
  {
    title: "4. Registros en la red blockchain",
    paragraphs: [
      "Las acciones sobre los documentos quedan en una red blockchain (Hyperledger Fabric) que, por su naturaleza, no permite modificar ni eliminar registros. Por eso allí solo se guarda el identificador interno del usuario, nunca su nombre ni su correo.",
    ],
  },
  {
    title: "5. Derechos del titular",
    paragraphs: ["Según el artículo 8 de la Ley 1581 de 2012, como titular puedes:"],
    items: [
      "Conocer, actualizar y rectificar tus datos personales.",
      "Solicitar prueba de la autorización otorgada.",
      "Ser informado sobre el uso que se ha dado a tus datos.",
      "Presentar quejas ante la Superintendencia de Industria y Comercio.",
      "Revocar la autorización o pedir la supresión de tus datos cuando no exista un deber legal o contractual de conservarlos.",
      "Acceder gratuitamente a tus datos personales.",
    ],
  },
  {
    title: "6. Cómo ejercer tus derechos",
    paragraphs: [
      `Escribe a ${POLICY_CONTACT_EMAIL}. Las consultas se responden en máximo 10 días hábiles y los reclamos en máximo 15 días hábiles (artículos 14 y 15 de la Ley 1581 de 2012).`,
    ],
  },
  {
    title: "7. Seguridad de la información",
    paragraphs: [
      "Los datos se protegen con contraseñas cifradas, verificación en dos pasos por correo, sesiones que vencen por inactividad y acceso restringido por rol.",
    ],
  },
  {
    title: "8. Vigencia y cambios",
    paragraphs: [
      `Esta es la versión ${POLICY_VERSION}, vigente desde el mes de ${POLICY_DATE}. Si la política cambia, se te pedirá aceptarla de nuevo antes de continuar usando la plataforma.`,
    ],
  },
]
