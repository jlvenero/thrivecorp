// backend/controllers/companiesController.test.js

const companiesController = require('./companiesController');
const companiesRepository = require('../models/companiesRepository');

// Simula o repositório. Não queremos testar o banco de dados aqui,
// apenas a lógica do *controlador*.
jest.mock('../models/companiesRepository');

describe('Companies Controller', () => {

  // Limpa os mocks após cada teste
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Teste do "caminho feliz"
  it('deve criar uma empresa com sucesso (status 201)', async () => {
    const req = {
      body: {
        name: 'Empresa Teste',
        cnpj: '12345678901234',
        address: 'Rua Teste, 123',
        admin_id: 1
      }
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn()
    };

    // Simula que o repositório funcionou e retornou o ID 123
    companiesRepository.createCompany.mockResolvedValue(123);

    // Executa a função
    await companiesController.createCompany(req, res);

    // Verifica se o repositório foi chamado com os dados corretos
    expect(companiesRepository.createCompany).toHaveBeenCalledWith(req.body);
    // Verifica se a resposta foi 201 (Created)
    expect(res.status).toHaveBeenCalledWith(201);
    // Verifica se a resposta JSON foi correta
    expect(res.json).toHaveBeenCalledWith({
      message: 'Empresa solicitada para registro com sucesso!',
      id: 123
    });
  });

  // Teste do "caminho triste" (erro)
  it('deve retornar 500 se o repositório falhar', async () => {
    const req = { body: {} }; // O body não importa aqui
    const res = {
      status: jest.fn(() => res),
      json: jest.fn()
    };

    // Simula um erro vindo do banco de dados/repositório
    const mockError = new Error('Falha no DB');
    companiesRepository.createCompany.mockRejectedValue(mockError);

    // Executa a função
    await companiesController.createCompany(req, res);

    // Verifica se a resposta foi 500 (Internal Server Error)
    expect(res.status).toHaveBeenCalledWith(500);
    // Verifica se a resposta JSON foi a de erro
    expect(res.json).toHaveBeenCalledWith({
      error: 'Erro ao solicitar registro da empresa.'
    });
  });
});