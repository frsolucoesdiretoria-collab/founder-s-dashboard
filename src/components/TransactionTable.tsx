import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Tag } from 'lucide-react';
import type { Transaction } from '@/types/finance';
import { cn } from '@/lib/utils';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onCategorize?: (transaction: Transaction) => void;
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  showCheckbox?: boolean;
}

export function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  onCategorize,
  selectedIds = [],
  onSelect,
  showCheckbox = false
}: TransactionTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {showCheckbox && <TableHead className="w-12"></TableHead>}
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Conta</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showCheckbox ? 7 : 6} className="text-center text-muted-foreground py-8">
                Nenhuma transação encontrada
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                className={cn(
                  !transaction.Category && "bg-yellow-50 dark:bg-yellow-950/10"
                )}
              >
                {showCheckbox && (
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(transaction.id)}
                      onChange={() => onSelect?.(transaction.id)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  {formatDate(transaction.Date)}
                </TableCell>
                <TableCell>{transaction.Name}</TableCell>
                <TableCell>
                  {transaction.Category ? (
                    <Badge variant="secondary">{transaction.Category}</Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-600 dark:text-yellow-500">
                      Não categorizada
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{transaction.Account}</TableCell>
                <TableCell className={cn(
                  "text-right font-medium",
                  transaction.Type === 'Entrada' 
                    ? "text-green-600 dark:text-green-500" 
                    : "text-red-600 dark:text-red-500"
                )}>
                  {transaction.Type === 'Entrada' ? '+' : '-'}
                  {formatCurrency(Math.abs(transaction.Amount))}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {onCategorize && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onCategorize(transaction)}
                        title="Categorizar"
                      >
                        <Tag className="h-4 w-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(transaction)}
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDelete(transaction)}
                        title="Deletar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}


