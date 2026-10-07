## Benchmarking Comparativo
| Benchmarking | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 |
| --- | --- | --- | --- |
| Dimensión / Criterio | Variable de Análisis | MVP Hyperledger Fabric\nDocker / Azure Student / Node.js / Go | Google Cloud Platform\nCloud Storage (Bucket Lock) · Cloud KMS · Cloud Run |
| 1. COSTO TOTAL DE PROPIEDAD (COP) | NaN | NaN | NaN |
| Recurso humano | Costo directo personal\n(investigadoras + director) | $20.800.000\n2 desarrolladoras × 160 h c/u (320 h en total)\nDirector × 32 h × $150.000/h | $20.800.000\nCosto equivalente estimado para integración\ncon APIs GCP y mayor curva IAM |
| Hardware | Equipos de cómputo | $0\n2 laptops propias + 2 PCs universidad\nSin costo adicional al proyecto | $0\nSin hardware propio requerido\nInfraestructura gestionada por Google |
| Software e infraestructura | Licencias, plataformas\ny servicios cloud | $292.000\nChatGPT Plus × 4 meses × $73.000/mes\nHyperledger Fabric, Docker, VS Code: open source\nAzure Student: proporcionado por universidad | $5.976.000 / 4 meses (~$1.494.000/mes)\nCAS DevOps: $1.280.000/mes\nDocument AI OCR 5.000 p.: $30.000/mes\nParser 1.000 p.: $120.000/mes\nCloud Storage 200 GB: $16.000/mes\nEgress 100 GB: $48.000/mes |
| Otros costos directos | Transporte, internet\ny electricidad | $454.400\nTransporte: 64 viajes × $7.100\nInternet y electricidad cubiertos\npor universidad y hogar | $454.400\nMismos costos logísticos\nNo varía por plataforma tecnológica |
| Imprevistos (8% sobre subtotal) | Reserva de contingencia | $1.723.712\n8% sobre subtotal del proyecto | ~$2.178.432\nMayor imprevisibilidad por costos\nvariables de volumen en GCP |
| TOTAL GENERAL DEL PROYECTO | Costo total estimado MVP | $23.270.112 ALINEADO AL PRESUPUESTO | ~$29.408.832 (escenario de 4 meses equivalente) |
| 2. INFRAESTRUCTURA Y DESPLIEGUE | NaN | NaN | NaN |
| Plataforma de despliegue | Entorno de ejecución\ny contenerización | Docker + Docker Compose en Azure Student\nRed local: 1 org, 1 peer, 1 orderer, 1 CA\nDespliegue controlado por 1 mes calendario | PaaS Google Cloud\nSin gestión de red de consenso\nAlta disponibilidad gestionada por Google |
| Escalabilidad | Capacidad de crecimiento\nde volumen documental | Costo marginal nulo al procesar más documentos\n20 docs sintéticos en validación (12 contratos + 8 NDA)\nSin escala elástica automática | Escalado automático y elástico\nDocument AI duplica costo al duplicar volumen\nIdeal para crecimiento masivo en producción |
| Curva de implementación | Complejidad técnica\nde despliegue | Alta - Requiere:\n· Generación certificados X.509 via cryptogen/Fabric CA\n· Configuración YAML Docker Compose con redes bridge\n· Ciclo de vida de chaincode en Go\n· Políticas de endoso y configuración de canales | Baja - Requiere:\n· Integración via REST/SDK en semanas\n· Gestión IAM sin protocolos de consenso manuales\n· Abstracción total de red, BD y parches de seguridad |
| 3. SEGURIDAD E INTEGRIDAD DOCUMENTAL | NaN | NaN | NaN |
| Mecanismo de inmutabilidad | Garantía técnica de\nno alteración documental | MATEMÁTICO Y DISTRIBUIDO\nHash SHA-256 encadenado por bloques\nAlterar 1 bit invalida todos los hashes posteriores\nen la red. En el MVP: 1 peer y 1 orderer; la réplica multi-nodo es proyección a producción. | CONTRACTUAL Y CENTRALIZADO\nBucket Lock WORM (Write Once, Read Many)\nInmutabilidad garantizada por política de servicio\nAuditado para SEC 17a-4(f) |
| Algoritmo criptográfico | Estándar de seguridad\naplicado al hash documental | SHA-256 (FIPS 180-4) + Certificados X.509\nFirma digital por transacción via Fabric CA\nAlineado a ISO/IEC 27001:2022 - Control A.8.24 | HSM gestionado / TLS 1.3\nCertificados X.509 emitidos por Google CA\nCumple estándares SEC 17a-4(f) |
| Control de acceso | Gestión de roles\ny permisos | Permisionado - 3 roles definidos:\n· Administrador del sistema\n· Empleado / firmante\n· Auditor / verificador\nPolíticas de endoso configurables en chaincode | IAM por servicio de Google\nAcceso granular a APIs por cuenta\nSin lógica de roles contractuales nativa\nRequiere desarrollo adicional para 3 roles |
| 4. CUMPLIMIENTO NORMATIVO COLOMBIANO | NaN | NaN | NaN |
| Ley 527 de 1999\n(Integridad — Art. 9) | Validez jurídica del\ndocumento electrónico | PLENO - Integridad matemática por SHA-256\nregistrado en ledger inmutable\nDetección automática de alteraciones post-registro | PLENO - Bucket Lock garantiza inalterabilidad\nLogs de auditoría centralizados |
| Ley 1581 de 2012\n(Datos personales) | Tratamiento y supresión\nde datos personales | MITIGADO - Patrón off-chain:\nDatos personales en MongoDB\nSolo hash en blockchain\nCumple por anonimización técnica (derecho al olvido) | NATIVO - DLP integrado en Document AI\nEliminación física directa de objetos\nSin conflicto entre inmutabilidad y derecho al olvido |
| Soberanía de datos\n(Circular SIC 005/2017) | Residencia física\nde los datos | COLOMBIA - Azure Student\nResidencia nacional garantizable\nSin transferencia internacional requerida | VARIABLE - Document AI procesa en us-central1 (EE.UU.)\nRequiere contrato de transmisión internacional\nEE.UU. reconocido por SIC como nivel adecuado |
| Valor probatorio\n(Sentencia SP248-2025) | Peso judicial de la\nevidencia digital | VERIFICABLE- Prueba matemática\nHash en el ledger inmutable de Fabric.\nDemuestra imposibilidad técnica de alteración\nsin consenso de toda la red | INSTITUCIONAL - Google como tercero de confianza\nPeso equivalente a acta notarial digital\nReconocido en litigios laborales colombianos |
| 5. DEPENDENCIA TECNOLÓGICA Y PORTABILIDAD | NaN | NaN | NaN |
| Vendor lock-in | Riesgo de dependencia\ndel proveedor | NULO - Open source Apache 2.0\nPortable entre proveedores con Docker\nSin APIs propietarias en la lógica del ledger\nLedger exportable y migrable | ALTO - APIs Document AI propietarias\nBucket Lock bloquea migración con retención activa\nReescritura total de integración al cambiar nube\nModelos de extracción no portables |
| Continuidad post-MVP | Escalabilidad hacia\nentorno productivo | MODERADA - Despliegue Azure: 1 mes\nDesmantelamiento al finalizar validación\nRequiere nueva infraestructura para producción\nBase técnica sólida para futura implementación | ALTA - Escala directamente a producción\nSin rediseño arquitectónico\nModelo Opex sin inversión inicial adicional\nIdeal para adopción organizacional rápida |
| NaN | NaN | NaN | NaN |
| VEREDICTO FINAL POR PERFIL ORGANIZACIONAL | NaN | NaN | NaN |
| MVP Hyperledger Fabric - Recomendado para este proyecto | NaN | Costo total $23.270.112 COP alineado al presupuesto aprobado. Soberanía de datos en Colombia. Inmutabilidad matemática verificable y distribuida. Sin dependencia de terceros. Ideal para MVP académico con validación técnica rigurosa y base sólida para futura implementación institucional. | NaN |
| Google Cloud Platform - Alternativa para escala productiva | NaN | Costo estimado ~$29.330.400 COP para el mismo período. Menor complejidad operativa, escalabilidad elástica y procesamiento documental inteligente con Document AI. Recomendado si el sistema evoluciona a producción con alto volumen y se priorizan rapidez de despliegue y gestión nativa de datos personales. | NaN |

## Leyenda y Referencias
| Leyenda, Criterios de Evaluación y Fuentes | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 |
| --- | --- | --- | --- |
| 1. DIMENSIONES Y CRITERIOS DE EVALUACIÓN | NaN | NaN | NaN |
| Dimensión | Descripción del criterio evaluado | Peso relativo | Norma/Fuente de referencia |
| 1. Costo Total de Propiedad | Suma de todos los costos directos e indirectos del proyecto: recurso humano, hardware, software, infraestructura, imprevistos y otros costos operativos durante el período de validación. | Alta - Viabilidad del proyecto | Presupuesto aprobado del proyecto |
| 2. Infraestructura y despliegue | Evaluación del entorno técnico de ejecución, complejidad de configuración, escalabilidad del sistema y curva de aprendizaje requerida para el equipo de desarrollo. | Alta - Factibilidad técnica | Hyperledger Fabric Docs v2.5 |
| 3. Seguridad e integridad documental | Mecanismos criptográficos que garantizan la inalterabilidad del contenido documental, el estándar de hash aplicado y el modelo de control de acceso por roles. | Muy alta - Core del MVP | ISO/IEC 27001:2022 - A.8.24 / FIPS 180-4 |
| 4. Cumplimiento normativo colombiano | Alineación con el marco legal colombiano para documentos electrónicos: validez jurídica, tratamiento de datos personales, soberanía de datos y valor probatorio ante tribunales. | Muy alta - Requisito legal | Ley 527/1999 · Ley 1581/2012 · SP248-2025 |
| 5. Dependencia tecnológica | Nivel de acoplamiento con el proveedor tecnológico, portabilidad del sistema entre entornos y viabilidad de continuidad operativa posterior a la fase de validación del MVP. | Media - Riesgo estratégico | Análisis de riesgo organizacional |
| NaN | NaN | NaN | NaN |
| 2. FUENTES BIBLIOGRÁFICAS Y NORMATIVAS | NaN | NaN | NaN |
| Clave | Referencia completa | Tipo | URL / Identificador |
| [1] | FEDESOFT. Caracterización del Sector TI en Colombia. Bogotá: FEDESOFT, 2023. | Sector | https://fedesoft.org/ |
| [2] | CONGRESO DE COLOMBIA. Ley 527 de 1999: Mensajes de datos, comercio electrónico y firmas digitales. | Normativa | Diario Oficial 43.673 · 18 ago 1999 |
| [3] | MinTIC. Guía de referencia para la adopción de blockchain para el Estado colombiano. v2. 2022. | Institucional | https://portalelearning.mintic.gov.co/ |
| [5] | NIST. SHA-3 Standard:Secure Hash Standard (SHS), FIPS PUB 180-4, ago. 2015 | Técnica | DOI: 10.6028/NIST.FIPS.180-4 |
| [8] | CONGRESO DE COLOMBIA. Ley 1581 de 2012: Protección de datos personales. | Normativa | Diario Oficial 48.587 · 17 oct 2012 |
| [10] | ISO/IEC 27001:2022. Information security management systems — Requirements. Ginebra: ISO. | Estándar | Control A.8.24 (criptografía) / A.8.11 |
| [25] | HYPERLEDGER FOUNDATION. Hyperledger Fabric Docs — A Blockchain Platform for the Enterprise. 2023. | Técnica | https://hyperledger-fabric.readthedocs.io/ |
| [26] | REHAN, M. et al. Supply chain using IoT Hyperledger Fabric network. Human-centric Computing. 2023. | Académica | DOI: 10.22967/HCIS.2023.13.004 |
| SIC/2017 | SUPERINTENDENCIA DE INDUSTRIA Y COMERCIO. Circular Externa 005 de 2017. Niveles adecuados de protección. | Normativa | https://www.suin-juriscol.gov.co/viewDocument.asp?id=30035611 |
| SP248-2025 | CORTE SUPREMA DE JUSTICIA. Sentencia SP248-2025. M.P. Gerson Chaverra Castro. Ene 2026. | Jurisprudencia | Rad. 5827 · https://rsanabria.co/2026/01/20/... |
| GCP-CAS | GOOGLE CLOUD. Certificate Authority Service Pricing. 2026. | Técnica/Precios | https://cloud.google.com/certificate-authority-service/pricing |
| GCP-DAI | GOOGLE CLOUD. Document AI Pricing. 2026. | Técnica/Precios | https://cloud.google.com/document-ai/pricing |
| GCP-GCS | GOOGLE CLOUD. Cloud Storage: Bucket Lock. Abr 2026. | Técnica/Precios | https://cloud.google.com/storage/docs/bucket-lock |
| VPS-CO | IMAGINA COLOMBIA. Servidores Virtuales Privados (VPS SSD). 2025. | Precios mercado | https://www.imaginacolombia.com/servidores-virtuales-privados/vps-ssd |
| HLF-BENCH | LF DECENTRALIZED TRUST. Benchmarking Hyperledger Fabric 2.5 Performance. Feb 2023. | Técnica | https://www.lfdecentralizedtrust.org/blog/... |
| 3. NOTAS METODOLÓGICAS | NaN | NaN | NaN |
| • Tasa de cambio COP/USD fija proyectada: $4.000 COP por 1 USD (referencia 2025–2026 para comparación estática). | NaN | NaN | NaN |
| • El costo de GCP corresponde a un escenario de uso equivalente al período de 4 meses del MVP (5.000 páginas/mes OCR, 1.000 páginas/mes parser, 200 GB almacenamiento, 100 GB egress, 1.000 certificados/mes). | NaN | NaN | NaN |
| • Los costos de recurso humano son iguales en ambos escenarios al tratarse de un costo interno del equipo, independiente de la plataforma tecnológica. | NaN | NaN | NaN |
| • El presupuesto del MVP Hyperledger Fabric ($23.270.112 COP) corresponde al presupuesto formalmente aprobado del proyecto de investigación. | NaN | NaN | NaN |
| • Esta tabla no constituye un proceso de auditoría de cumplimiento normativo. Es un instrumento de análisis comparativo para decisión de diseño arquitectónico. | NaN | NaN | NaN |
| El escenario GCP se modela con servicios gestionados de procesamiento documental (Document AI) y autoridad certificadora (CAS), es decir, un escenario de máxima funcionalidad para producción. Una configuración mínima equivalente al MVP (Cloud Storage con Bucket Lock + Cloud KMS + Cloud Run) costaría aproximadamente $23,2 M COP, similar al MVP. | NaN | NaN | NaN |
