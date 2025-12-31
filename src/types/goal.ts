// FR Tech OS - Goal Types

export interface Goal {
  id: string;
  Name: string;
  KPI: string;
  Year: number;
  Month: number;
  WeekKey: string;
  PeriodStart: string;
  PeriodEnd: string;
  Target: number;
  Actions: string[];
  Actual: number;
  ProgressPct: number;
  VisiblePublic: boolean;
  VisibleAdmin: boolean;
  Notes: string;
}
