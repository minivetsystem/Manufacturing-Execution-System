import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Batch, Lot } from "@/types/batch";
import { useOperator } from "@/contexts/OperatorContext";
import { OperatorSelect } from "@/components/OperatorSelect";
import { BatchCard } from "@/components/BatchCard";
import { BatchCompletionForm } from "@/components/BatchCompletionForm";
import { ProductionHistory } from "@/components/ProductionHistory";
import { TraceabilityView } from "@/components/TraceabilityView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Factory, History } from "lucide-react";

const initialBatches: Batch[] = [
  {
    id: "B-001",
    productName: "Chocolate Syrup 10L",
    targetQuantity: 1000,
    uom: "L",
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
    uom: "L",
    status: "Planned",
    materials: [
      { name: "Vanilla Extract", plannedQty: 50, unit: "L" },
      { name: "Sugar", plannedQty: 150, unit: "kg" },
      { name: "Milk", plannedQty: 300, unit: "L" },
    ],
  },
  {
    id: "B-003",
    productName: "Strawberry Blend 8L",
    targetQuantity: 800,
    uom: "L",
    status: "Planned",
    materials: [
      { name: "Strawberry Puree", plannedQty: 250, unit: "kg" },
      { name: "Sugar", plannedQty: 200, unit: "kg" },
      { name: "Water", plannedQty: 350, unit: "L" },
    ],
  },
];

const ManufacturingDashboard = () => {
  const { operator } = useOperator();
  const navigate = useNavigate();
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [completingBatch, setCompletingBatch] = useState<Batch | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);

  useEffect(() => {
    if (!operator) {
      navigate("/login");
    }
  }, [operator, navigate]);

  const handleStart = (id: string) => {
    if (!operator) {
      toast.error("Please select an operator first");
      return;
    }

    setBatches((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status: b.status === "Paused" ? "In Process" : "In Process",
              startTime: b.startTime || new Date().toISOString(),
              pauseTime: undefined,
              operator,
            }
          : b
      )
    );
    toast.success(`Batch ${id} started by ${operator}`);
  };

  const handlePause = (id: string) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: "Paused", pauseTime: new Date().toISOString() }
          : b
      )
    );
    toast.info(`Batch ${id} paused`);
  };

  const handleComplete = (id: string) => {
    const batch = batches.find((b) => b.id === id);
    if (batch) {
      setCompletingBatch(batch);
    }
  };

  const handleSaveCompletion = (data: {
    batchId: string;
    actualYield: number;
    scrapQuantity: number;
    lotNumber: string;
    materials: any[];
    operator: string;
  }) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === data.batchId
          ? { ...b, status: "Completed", endTime: new Date().toISOString() }
          : b
      )
    );

    const batch = batches.find((b) => b.id === data.batchId);
    if (batch) {
      const newLot: Lot = {
        lot: data.lotNumber,
        product: batch.productName,
        yield: data.actualYield,
        batchId: data.batchId,
        operator: data.operator,
        inputs: data.materials.map((m) => ({
          material: m.name,
          qty: m.actualQty || m.plannedQty,
          unit: m.unit,
        })),
        completedAt: new Date().toISOString(),
      };
      setLots((prev) => [newLot, ...prev]);
    }

    setCompletingBatch(null);
    toast.success(`Batch ${data.batchId} completed successfully! Lot: ${data.lotNumber}`);
  };

  const activeBatches = batches.filter((b) => b.status !== "Completed");
  const completedCount = batches.filter((b) => b.status === "Completed").length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Factory className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Manufacturing Execution System</h1>
                <p className="text-sm text-muted-foreground">Production Floor Dashboard</p>
              </div>
            </div>
            <OperatorSelect />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="batches" className="space-y-4">
          <TabsList>
            <TabsTrigger value="batches" className="gap-2">
              <Factory className="h-4 w-4" />
              Active Batches ({activeBatches.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Production History ({completedCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="batches" className="space-y-4">
            {!operator && (
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-sm">
                ⚠️ Please select an operator to start working with batches
              </div>
            )}
            {activeBatches.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                All batches completed!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeBatches.map((batch) => (
                  <BatchCard
                    key={batch.id}
                    batch={batch}
                    onStart={handleStart}
                    onPause={handlePause}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <ProductionHistory lots={lots} onSelectLot={setSelectedLot} />
          </TabsContent>
        </Tabs>
      </main>

      <BatchCompletionForm
        batch={completingBatch}
        onClose={() => setCompletingBatch(null)}
        onSave={handleSaveCompletion}
      />

      <TraceabilityView lot={selectedLot} onClose={() => setSelectedLot(null)} />
    </div>
  );
};

export default ManufacturingDashboard;
