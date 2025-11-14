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
import { Factory, History, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useManufacturing } from "@/contexts/ManufacturingContext";
import { BatchCompletionDialog } from "@/components/BatchCompletionDialog";




const ManufacturingDashboard = () => {
  const { operator, logout } = useOperator();
  const navigate = useNavigate();
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
 const { batches, updateBatch, completeBatch } = useManufacturing();
   const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  useEffect(() => {
    if (!operator) {
      navigate("/login");
    }
  }, [operator, navigate]);

  

 const handleStartBatch = (batchId: string) => {
    updateBatch(batchId, {
      status: "In Process",
      startTime: new Date().toISOString(),
      operator,
    });
  };

  const handlePauseBatch = (batchId: string) => {
    updateBatch(batchId, {
      status: "Paused",
      pauseTime: new Date().toISOString(),
    });
  };

    const handleCompleteBatch = (data: any) => {
    if (selectedBatch) {
      completeBatch(selectedBatch.id, data);
      setCompletionDialogOpen(false);
      setSelectedBatch(null);
    }
  };

  const handleOpenCompletion = (batch: Batch) => {
    setSelectedBatch(batch);
    setCompletionDialogOpen(true);
  };

  // const handleSaveCompletion = (data: {
  //   batchId: string;
  //   actualYield: number;
  //   scrapQuantity: number;
  //   lotNumber: string;
  //   materials: any[];
  //   operator: string;
  // }) => {

  //   if (selectedBatch) {
  //     completeBatch(selectedBatch.id, data);
  //     setCompletionDialogOpen(false);
  //     setSelectedBatch(null);
  //   }

  //   const batch = batches.find((b) => b.id === data.batchId);
  //   if (batch) {
  //     const newLot: Lot = {
  //       lot: data.lotNumber,
  //       product: batch.productName,
  //       yield: data.actualYield,
  //       batchId: data.batchId,
  //       operator: data.operator,
  //       inputs: data.materials.map((m) => ({
  //         material: m.name,
  //         qty: m.actualQty || m.plannedQty,
  //         unit: m.unit,
  //       })),
  //       completedAt: new Date().toISOString(),
  //     };
  //     setLots((prev) => [newLot, ...prev]);
  //   }

  //   setCompletingBatch(null);
  //   toast.success(`Batch ${data.batchId} completed successfully! Lot: ${data.lotNumber}`);
  // };

   const handleLogout = () => {
    logout();
    navigate("/login");
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
            {/* <OperatorSelect /> */}
             <Button  onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
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
                    onStart={() => handleStartBatch(batch.id)}
                    onPause={() => handlePauseBatch(batch.id)}
                    onComplete={() => handleOpenCompletion(batch)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <ProductionHistory onSelectLot={setSelectedLot}  />
          </TabsContent>
        </Tabs>
      </main>

      {/* <BatchCompletionForm
        batch={completingBatch}
        onClose={() => setCompletingBatch(null)}
        onSave={handleSaveCompletion}
      /> */}

      <BatchCompletionDialog
        batch={selectedBatch}
        open={completionDialogOpen}
        onClose={() => setCompletionDialogOpen(false)}
        onComplete={handleCompleteBatch}
        operator={operator || ""}
      />

      <TraceabilityView lot={selectedLot} onClose={() => setSelectedLot(null)} />
    </div>
  );
};

export default ManufacturingDashboard;
