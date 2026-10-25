// Las pruebas de fallos (Fabric o Mongo caídos, correo rechazado) hacen que el
// backend registre el error a propósito: se silencia para no ensuciar la salida.
let errorSpy: jest.SpyInstance;

beforeEach(() => {
  errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  errorSpy.mockRestore();
});
