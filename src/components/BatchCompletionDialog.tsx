import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Batch, Material } from "@/types/batch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface BatchCompletionDialogProps {
  batch: Batch | null;
  open: boolean;
  onClose: () => void;
  onComplete: (data: {
    actualYield: number;
    scrapQuantity: number;
    lotNumber: string;
    materialsUsed: Material[];
    operator: string;
  }) => void;
  operator: string;
}

export const BatchCompletionDialog = ({
  batch,
  open,
  onClose,
  onComplete,
  operator,
}: BatchCompletionDialogProps) => {
  const [actualYield, setActualYield] = useState("");
  const [scrapQuantity, setScrapQuantity] = useState("");
  const [materialsUsed, setMaterialsUsed] = useState<Material[]>(
    batch?.materials.map((m) => ({ ...m, actualQty: m.plannedQty })) || []
  );
console.log(batch)
  const handleMaterialChange = (index: number, value: string) => {
    const newMaterials = [...materialsUsed];
    newMaterials[index].actualQty = parseFloat(value) || 0;
    setMaterialsUsed(newMaterials);
  };
  useEffect(() => {
  if (batch) {
    setMaterialsUsed(
      batch.materials.map((m) => ({
        ...m,
        actualQty: m.plannedQty,
      }))
    );
  }
}, [batch]);

  const handleSubmit = () => {
    if (!batch || !actualYield) {
      toast.error("Please fill in all required fields");
      return;
    }

    const lotNumber = `LOT-${batch.id}-${String(Date.now()).slice(-6)}`;

    onComplete({
      actualYield: parseFloat(actualYield),
      scrapQuantity: parseFloat(scrapQuantity) || 0,
      lotNumber,
      materialsUsed,
      operator,
    });

    toast.success(`Batch ${batch.id} completed successfully!`, {
      description: `Lot number: ${lotNumber}`,
    });

    // Reset form
    setActualYield("");
    setScrapQuantity("");
    onClose();
  };

  if (!batch) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Batch: {batch.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batchId">Batch ID</Label>
              <Input id="batchId" value={batch.id} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Input id="product" value={batch.productName} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actualYield">
                Actual Yield <span className="text-destructive">*</span>
              </Label>
              <Input
                id="actualYield"
                type="number"
                placeholder={`Target: ${batch.targetQuantity}`}
                value={actualYield}
                onChange={(e) => setActualYield(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scrapQuantity">Scrap Quantity</Label>
              <Input
                id="scrapQuantity"
                type="number"
                placeholder="0"
                value={scrapQuantity}
                onChange={(e) => setScrapQuantity(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Materials Used</Label>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Target Qty</TableHead>
                  <TableHead>Actual Qty</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materialsUsed.map((material, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell>{material.plannedQty}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={material.actualQty}
                        onChange={(e) => handleMaterialChange(index, e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>{material.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save & Finish</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
