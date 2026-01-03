// FR Tech OS - OFX Parser for Bank Statements
// Parses OFX (Open Financial Exchange) files

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'Entrada' | 'Saída';
}

/**
 * Parse OFX bank statement
 */
export function parseOFX(ofxContent: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];

  // OFX files have a specific structure
  // We'll look for <STMTTRN> tags which contain transaction data
  
  // Extract all transaction blocks
  const transactionRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
  let match;

  while ((match = transactionRegex.exec(ofxContent)) !== null) {
    const transactionBlock = match[1];
    
    // Extract date
    const dateMatch = /<DTPOSTED>(\d{8})(\d{6})?/.exec(transactionBlock);
    let date = '';
    if (dateMatch) {
      // OFX dates are in format YYYYMMDD or YYYYMMDDHHMMSS
      const dateStr = dateMatch[1];
      date = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
    }

    // Extract description/memo
    const memoMatch = /<MEMO>([^<]+)/.exec(transactionBlock);
    const nameMatch = /<NAME>([^<]+)/.exec(transactionBlock);
    const description = (memoMatch?.[1] || nameMatch?.[1] || '').trim();

    // Extract amount
    const amountMatch = /<TRNAMT>([^<]+)/.exec(transactionBlock);
    const amountStr = amountMatch?.[1]?.trim() || '0';
    const amount = parseFloat(amountStr) || 0;

    if (date && description) {
      transactions.push({
        date,
        description,
        amount: Math.abs(amount),
        type: amount >= 0 ? 'Entrada' : 'Saída'
      });
    }
  }

  return transactions;
}

/**
 * Detect if content is OFX format
 */
export function isOFXFormat(content: string): boolean {
  return content.includes('<OFX>') || content.includes('<?OFX') || content.includes('<STMTTRN>');
}


