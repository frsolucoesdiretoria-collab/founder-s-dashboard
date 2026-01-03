// FR Tech OS - CSV Parser for Bank Statements
// Parses CSV files from various Brazilian banks

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'Entrada' | 'Saída';
}

/**
 * Parse CSV bank statement
 * Supports multiple formats from Brazilian banks
 */
export function parseCSV(csvContent: string, accountName: string): ParsedTransaction[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file is empty or invalid');
  }

  // Try to detect the format by analyzing the first few lines
  const header = lines[0].toLowerCase();
  
  // Nubank format
  if (header.includes('data') && header.includes('descrição') && header.includes('valor')) {
    return parseNubankCSV(lines);
  }
  
  // Inter format
  if (header.includes('data') && header.includes('historico') && header.includes('valor')) {
    return parseInterCSV(lines);
  }
  
  // Generic format (try to auto-detect columns)
  return parseGenericCSV(lines);
}

/**
 * Parse Nubank CSV format
 */
function parseNubankCSV(lines: string[]): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const header = lines[0].toLowerCase();
  const headerCols = header.split(',').map(col => col.trim().replace(/"/g, ''));
  
  const dateIndex = headerCols.findIndex(col => col.includes('data'));
  const descIndex = headerCols.findIndex(col => col.includes('descrição') || col.includes('descricao'));
  const valueIndex = headerCols.findIndex(col => col.includes('valor'));

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);
    
    if (cols.length < Math.max(dateIndex, descIndex, valueIndex) + 1) continue;

    const dateStr = cols[dateIndex]?.trim().replace(/"/g, '') || '';
    const description = cols[descIndex]?.trim().replace(/"/g, '') || '';
    const valueStr = cols[valueIndex]?.trim().replace(/"/g, '').replace(/\./g, '').replace(',', '.') || '0';

    if (!dateStr || !description) continue;

    const amount = parseFloat(valueStr) || 0;
    const date = parseDate(dateStr);
    
    if (!date) continue;

    transactions.push({
      date,
      description,
      amount: Math.abs(amount),
      type: amount >= 0 ? 'Entrada' : 'Saída'
    });
  }

  return transactions;
}

/**
 * Parse Inter bank CSV format
 */
function parseInterCSV(lines: string[]): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const header = lines[0].toLowerCase();
  const headerCols = header.split(',').map(col => col.trim().replace(/"/g, ''));
  
  const dateIndex = headerCols.findIndex(col => col.includes('data'));
  const histIndex = headerCols.findIndex(col => col.includes('historico') || col.includes('histórico'));
  const valueIndex = headerCols.findIndex(col => col.includes('valor'));

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);
    
    if (cols.length < Math.max(dateIndex, histIndex, valueIndex) + 1) continue;

    const dateStr = cols[dateIndex]?.trim().replace(/"/g, '') || '';
    const description = cols[histIndex]?.trim().replace(/"/g, '') || '';
    const valueStr = cols[valueIndex]?.trim().replace(/"/g, '').replace(/\./g, '').replace(',', '.') || '0';

    if (!dateStr || !description) continue;

    const amount = parseFloat(valueStr) || 0;
    const date = parseDate(dateStr);
    
    if (!date) continue;

    transactions.push({
      date,
      description,
      amount: Math.abs(amount),
      type: amount >= 0 ? 'Entrada' : 'Saída'
    });
  }

  return transactions;
}

/**
 * Parse generic CSV format (auto-detect)
 */
function parseGenericCSV(lines: string[]): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const header = lines[0].toLowerCase();
  const headerCols = header.split(',').map(col => col.trim().replace(/"/g, ''));
  
  // Try to find date, description, and value columns
  const dateIndex = headerCols.findIndex(col => 
    col.includes('data') || col.includes('date') || col.includes('dt')
  );
  const descIndex = headerCols.findIndex(col => 
    col.includes('desc') || col.includes('historico') || col.includes('histórico') || 
    col.includes('descrição') || col.includes('descricao') || col.includes('memo')
  );
  const valueIndex = headerCols.findIndex(col => 
    col.includes('valor') || col.includes('value') || col.includes('amount') || 
    col.includes('vlr') || col.includes('saldo')
  );

  if (dateIndex === -1 || descIndex === -1 || valueIndex === -1) {
    throw new Error('Could not detect required columns in CSV. Expected: date, description, value');
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);
    
    if (cols.length < Math.max(dateIndex, descIndex, valueIndex) + 1) continue;

    const dateStr = cols[dateIndex]?.trim().replace(/"/g, '') || '';
    const description = cols[descIndex]?.trim().replace(/"/g, '') || '';
    const valueStr = cols[valueIndex]?.trim().replace(/"/g, '').replace(/\./g, '').replace(',', '.') || '0';

    if (!dateStr || !description) continue;

    const amount = parseFloat(valueStr) || 0;
    const date = parseDate(dateStr);
    
    if (!date) continue;

    transactions.push({
      date,
      description,
      amount: Math.abs(amount),
      type: amount >= 0 ? 'Entrada' : 'Saída'
    });
  }

  return transactions;
}

/**
 * Parse a CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

/**
 * Parse date string in various formats
 */
function parseDate(dateStr: string): string | null {
  // Try DD/MM/YYYY
  const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(dateStr);
  if (ddmmyyyy) {
    return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
  }

  // Try YYYY-MM-DD
  const yyyymmdd = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
  if (yyyymmdd) {
    return dateStr;
  }

  // Try DD-MM-YYYY
  const ddmmyyyy2 = /^(\d{2})-(\d{2})-(\d{4})/.exec(dateStr);
  if (ddmmyyyy2) {
    return `${ddmmyyyy2[3]}-${ddmmyyyy2[2]}-${ddmmyyyy2[1]}`;
  }

  // Try to parse as ISO date
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }

  return null;
}


