// FR Tech OS - KPI Types

export interface KPI {
  id: string;
  Name: string;
  Category: string;
  Periodicity: 'Anual' | 'Mensal' | 'Semanal' | 'Diário';
  ChartType: 'line' | 'bar' | 'area' | 'number';
  Unit: string;
  TargetValue: number;
  VisiblePublic: boolean;
  VisibleAdmin: boolean;
  IsFinancial: boolean;
  SortOrder: number;
  Active: boolean;
  Description: string;
}
