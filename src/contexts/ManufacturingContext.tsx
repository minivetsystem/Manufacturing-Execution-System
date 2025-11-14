import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { Batch, CompletedBatch, Lot } from "@/types/batch";

interface ManufacturingContextType {
  batches: Batch[];
  completedBatches: CompletedBatch[];
  lots: Lot[];
  updateBatch: (batchId: string, updates: Partial<Batch>) => void;
  completeBatch: (batchId: string, completionData: Omit<CompletedBatch, "id" | "productName" | "targetQuantity" | "unit" | "materials">) => void;
}

const ManufacturingContext = createContext<ManufacturingContextType | undefined>(undefined);

const initialBatches: Batch[] = [
  {
    id: "B-001",
    productName: "Chocolate Syrup 10L",
    targetQuantity: 1000,
    unit: "L",
    status: "Planned",
    materials: [
      { name: "Cocoa Powder", plannedQty: 200, unit: "kg" },
      { name: "Sugar", plannedQty: 300, unit: "kg" },
      { name: "Milk", plannedQty: 500, unit: "L" },
    ],
  },
  {
    id: "B-002",
    productName: "Vanilla Mix 5L",
    targetQuantity: 500,
    unit: "L",
    status: "Planned",
    materials: [
      { name: "Vanilla Extract", plannedQty: 50, unit: "L" },
      { name: "Sugar", plannedQty: 150, unit: "kg" },
      { name: "Water", plannedQty: 300, unit: "L" },
    ],
  },
  {
    id: "B-003",
    productName: "Strawberry Syrup 15L",
    targetQuantity: 1500,
    unit: "L",
    status: "Planned",
    inputs: [
      { name: "Strawberry Puree", plannedQty: 400, unit: "kg" },
      { name: "Sugar", plannedQty: 500, unit: "kg" },
      { name: "Preservative", plannedQty: 10, unit: "kg" },
    ],
  },
];

export const ManufacturingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [batches, setBatches] = useState<Batch[]>(() => {
    const saved = localStorage.getItem("batches");
    return saved ? JSON.parse(saved) : initialBatches;
  });

  const [completedBatches, setCompletedBatches] = useState<CompletedBatch[]>(() => {
    const saved = localStorage.getItem("completedBatches");
    return saved ? JSON.parse(saved) : [];
  });

  const [lots, setLots] = useState<Lot[]>(() => {
    const saved = localStorage.getItem("lots");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("batches", JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem("completedBatches", JSON.stringify(completedBatches));
  }, [completedBatches]);

  useEffect(() => {
    localStorage.setItem("lots", JSON.stringify(lots));
  }, [lots]);

  const updateBatch = (batchId: string, updates: Partial<Batch>) => {
    setBatches((prev) =>
      prev.map((batch) => (batch.id === batchId ? { ...batch, ...updates } : batch))
    );
  };

  const completeBatch = (
    batchId: string,
    completionData: Omit<CompletedBatch, "id" | "productName" | "targetQuantity" | "uom" | "materials">
  ) => {
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return;

    const completedBatch: CompletedBatch = {
      ...batch,
      ...completionData,
      status: "Completed",
      endTime: new Date().toISOString(),
    };

    setCompletedBatches((prev) => [...prev, completedBatch]);

    const newLot: Lot = {
      lot: completionData.lotNumber,
      product: batch.productName,
      yield: completionData.actualYield,
      batchId: batch.id,
      completedAt: new Date().toISOString(),
      operator: completionData.operator || "Unknown",
      inputs: completionData.materialsUsed.map((m) => ({
        material: m.name,
        qty: m.actualQty || 0,
        unit: m.unit,
      })),
    };

    setLots((prev) => [...prev, newLot]);
    updateBatch(batchId, { status: "Completed", endTime: new Date().toISOString() });
  };

  return (
    <ManufacturingContext.Provider
      value={{ batches, completedBatches, lots, updateBatch, completeBatch }}
    >
      {children}
    </ManufacturingContext.Provider>
  );
};

export const useManufacturing = () => {
  const context = useContext(ManufacturingContext);
  if (context === undefined) {
    throw new Error("useManufacturing must be used within a ManufacturingProvider");
  }
  return context;
};
