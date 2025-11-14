export type BatchStatus = "Planned" | "In Process" | "Paused" | "Completed";

export interface Material {
  name: string;
  plannedQty: number;
  actualQty?: number;
  unit: string;
}

export interface Batch {
  id: string;
  productName: string;
  targetQuantity: number;
  unit: string;
  status: BatchStatus;
  startTime?: string;
  endTime?: string;
  pauseTime?: string;
  materials: Material[];
  operator?: string;
}

export interface CompletedBatch extends Batch {
  actualYield: number;
  scrapQuantity: number;
  lotNumber: string;
  materialsUsed: Material[];
}

export interface Lot {
  lot: string;
  product: string;
  yield: number;
  batchId: string;
  completedAt: string;
  operator: string;
  inputs: {
    material: string;
    qty: number;
    unit: string;
  }[];
  
}
