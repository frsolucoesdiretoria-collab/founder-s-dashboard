// DOMA CONDO Client Data Layer
import type {
  DomaCondoClient,
  DomaCondoClientAuth,
  RelatorioMensal,
} from '../../src/types/domaCondoClient';
import {
  domaCondoClientsMock,
  clientPasswords,
  getRelatorioMensal,
  validateClientLogin,
} from '../../src/mocks/domaCondoClientReport';

// Simular banco de dados em memória (em produção, usar banco real)
const clientsDB: DomaCondoClient[] = [...domaCondoClientsMock];

/**
 * Buscar cliente por ID
 */
export function getClientById(clientId: string): DomaCondoClient | null {
  return clientsDB.find(c => c.id === clientId) || null;
}

/**
 * Buscar cliente por login
 */
export function getClientByLogin(login: string): DomaCondoClient | null {
  return clientsDB.find(c => c.login === login) || null;
}

/**
 * Validar credenciais do cliente
 */
export function validateCredentials(login: string, password: string): DomaCondoClient | null {
  return validateClientLogin(login, password);
}

/**
 * Obter relatório mensal
 */
export function getRelatorioByClienteAndMes(
  clienteId: string,
  mesReferencia: string
): RelatorioMensal | null {
  return getRelatorioMensal(clienteId, mesReferencia);
}





