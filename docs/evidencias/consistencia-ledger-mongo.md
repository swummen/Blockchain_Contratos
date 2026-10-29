# Consistencia entre el ledger y la base de datos (TRZ-03 · RNF-13)

| | |
|---|---|
| **Resultado** | **CUMPLE**: 50 de 50 documentos con la misma huella y el mismo estado |
| Fecha | 29/10/2026 11:22 |
| Entorno | SOFI-PC |

Por cada documento de MongoDB (colección `documents`) se consulta `GetDocument` en el chaincode
y se comparan la huella SHA-256 y el estado. Huellas y identificadores abreviados.

| Documento | ID | Huella en MongoDB | Huella en el ledger | Estado en MongoDB | Estado en el ledger | Resultado |
|---|---|---|---|---|---|---|
| orig.pdf | `4b3df87a…` | `8d6f084eb319…` | `8d6f084eb319…` | Alterado | Alterado | PASS |
| orig.pdf | `5c196981…` | `8d6f084eb319…` | `8d6f084eb319…` | Alterado | Alterado | PASS |
| orig.pdf | `b86b934e…` | `8d6f084eb319…` | `8d6f084eb319…` | Alterado | Alterado | PASS |
| big.pdf | `a1e398c3…` | `12a81a0ee271…` | `12a81a0ee271…` | Pendiente | Pendiente | PASS |
| prueba-csp.pdf | `baa6ccf8…` | `4271c364fd8e…` | `4271c364fd8e…` | Pendiente | Pendiente | PASS |
| C01-contrato-laura-camila.pdf | `5255031b…` | `96e0f727f155…` | `96e0f727f155…` | Alterado | Alterado | PASS |
| C02-contrato-juan-sebastian.pdf | `572d1ba9…` | `7bc3c463c050…` | `7bc3c463c050…` | Alterado | Alterado | PASS |
| C03-contrato-valentina-ortiz.pdf | `ff622513…` | `33d3817d99f8…` | `33d3817d99f8…` | Alterado | Alterado | PASS |
| C04-contrato-carlos-andres.pdf | `085b23f0…` | `9dce77efd675…` | `9dce77efd675…` | Alterado | Alterado | PASS |
| C05-contrato-daniela-rojas.pdf | `c5e8145e…` | `05fc51a0c65c…` | `05fc51a0c65c…` | Alterado | Alterado | PASS |
| C06-contrato-miguel-angel.pdf | `c4966107…` | `6c8f2b7a41d8…` | `6c8f2b7a41d8…` | Alterado | Alterado | PASS |
| C07-contrato-sara-lucia.pdf | `f582ba79…` | `76a81845e810…` | `76a81845e810…` | Alterado | Alterado | PASS |
| C08-contrato-felipe-castro.pdf | `efd8ae31…` | `fd17430a88f8…` | `fd17430a88f8…` | Alterado | Alterado | PASS |
| C09-contrato-mariana-herrera.pdf | `21b255c4…` | `a6636ba4d69c…` | `a6636ba4d69c…` | Alterado | Alterado | PASS |
| C10-contrato-santiago-lopez.pdf | `23ea4ec5…` | `59603c317585…` | `59603c317585…` | Alterado | Alterado | PASS |
| C11-contrato-isabella-vargas.pdf | `399a6675…` | `76ce2d0e10eb…` | `76ce2d0e10eb…` | Alterado | Alterado | PASS |
| C12-contrato-tomas-ramirez.pdf | `134048ed…` | `9f535c672286…` | `9f535c672286…` | Alterado | Alterado | PASS |
| N01-confidencialidad-natalia-moreno.pdf | `ccadb47b…` | `3e879da50544…` | `3e879da50544…` | Alterado | Alterado | PASS |
| N02-confidencialidad-esteban-quintero.pdf | `4b59dc51…` | `28f4c924458b…` | `28f4c924458b…` | Alterado | Alterado | PASS |
| N03-confidencialidad-paula-andrea.pdf | `775dcec9…` | `cf6452071db9…` | `cf6452071db9…` | Alterado | Alterado | PASS |
| N04-confidencialidad-diego-alejandro.pdf | `5b4a80c5…` | `19fd9587d2f6…` | `19fd9587d2f6…` | Alterado | Alterado | PASS |
| N05-confidencialidad-camila-fernandez.pdf | `33990113…` | `b6e321358f91…` | `b6e321358f91…` | Alterado | Alterado | PASS |
| N06-confidencialidad-andres-salazar.pdf | `d3ebcea2…` | `428ac1c8fd85…` | `428ac1c8fd85…` | Alterado | Alterado | PASS |
| N07-confidencialidad-juliana-pardo.pdf | `d7ca41b5…` | `b39b04f1df3c…` | `b39b04f1df3c…` | Alterado | Alterado | PASS |
| N08-confidencialidad-ricardo-mejia.pdf | `a0550efe…` | `3bb79739de0d…` | `3bb79739de0d…` | Alterado | Alterado | PASS |
| contrato-laboral-C01.pdf | `838707d4…` | `d3f3aef71ccd…` | `d3f3aef71ccd…` | Alterado | Alterado | PASS |
| contrato-medicion-latencia.pdf | `a06d26f5…` | `a02ccc145e34…` | `a02ccc145e34…` | Verificado | Verificado | PASS |
| orig.pdf | `e8336d6a…` | `8d6f084eb319…` | `8d6f084eb319…` | Alterado | Alterado | PASS |
| contrato-evidencia.pdf | `baf81f41…` | `21399cfcb87f…` | `21399cfcb87f…` | Alterado | Alterado | PASS |
| orig.pdf | `de8d5ada…` | `8d6f084eb319…` | `8d6f084eb319…` | Alterado | Alterado | PASS |
| C01-contrato-laura-camila.pdf | `bae345b5…` | `449bf4f0ef53…` | `449bf4f0ef53…` | Alterado | Alterado | PASS |
| C02-contrato-juan-sebastian.pdf | `29a1283f…` | `2dbd1db83103…` | `2dbd1db83103…` | Alterado | Alterado | PASS |
| C03-contrato-valentina-ortiz.pdf | `8b33a0ff…` | `b62c0cfa18b4…` | `b62c0cfa18b4…` | Alterado | Alterado | PASS |
| C04-contrato-carlos-andres.pdf | `49693f26…` | `976819caf314…` | `976819caf314…` | Alterado | Alterado | PASS |
| C05-contrato-daniela-rojas.pdf | `260e66df…` | `3c544c28ccdc…` | `3c544c28ccdc…` | Alterado | Alterado | PASS |
| C06-contrato-miguel-angel.pdf | `06910126…` | `17c318ee9fa6…` | `17c318ee9fa6…` | Alterado | Alterado | PASS |
| C07-contrato-sara-lucia.pdf | `8fc33419…` | `e02eb9f2de3c…` | `e02eb9f2de3c…` | Alterado | Alterado | PASS |
| C08-contrato-felipe-castro.pdf | `66dbd9d7…` | `7ecf7f21d405…` | `7ecf7f21d405…` | Alterado | Alterado | PASS |
| C09-contrato-mariana-herrera.pdf | `4dec7663…` | `eb4c11a0260b…` | `eb4c11a0260b…` | Alterado | Alterado | PASS |
| C10-contrato-santiago-lopez.pdf | `2cd215ec…` | `602b78024c86…` | `602b78024c86…` | Alterado | Alterado | PASS |
| C11-contrato-isabella-vargas.pdf | `b253ae40…` | `a4fd2541bb25…` | `a4fd2541bb25…` | Alterado | Alterado | PASS |
| C12-contrato-tomas-ramirez.pdf | `ab20fa68…` | `e8bad382f8c6…` | `e8bad382f8c6…` | Alterado | Alterado | PASS |
| N01-confidencialidad-natalia-moreno.pdf | `d974be6c…` | `40f8bc96e962…` | `40f8bc96e962…` | Alterado | Alterado | PASS |
| N02-confidencialidad-esteban-quintero.pdf | `c27240e0…` | `bcfed22c9da4…` | `bcfed22c9da4…` | Alterado | Alterado | PASS |
| N03-confidencialidad-paula-andrea.pdf | `9cf3f080…` | `2764bafe12ca…` | `2764bafe12ca…` | Alterado | Alterado | PASS |
| N04-confidencialidad-diego-alejandro.pdf | `22049e4a…` | `6ecf3d595bd2…` | `6ecf3d595bd2…` | Alterado | Alterado | PASS |
| N05-confidencialidad-camila-fernandez.pdf | `77bf4f3f…` | `106d90e4bf83…` | `106d90e4bf83…` | Alterado | Alterado | PASS |
| N06-confidencialidad-andres-salazar.pdf | `9964e149…` | `d2e817201969…` | `d2e817201969…` | Verificado | Verificado | PASS |
| N07-confidencialidad-juliana-pardo.pdf | `9bf755ef…` | `a476a74f551f…` | `a476a74f551f…` | Verificado | Verificado | PASS |
| N08-confidencialidad-ricardo-mejia.pdf | `b951b0ba…` | `a54462a3b227…` | `a54462a3b227…` | Verificado | Verificado | PASS |
