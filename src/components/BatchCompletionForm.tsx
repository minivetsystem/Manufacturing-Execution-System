import { useState } from "react";
import { Batch, Material } from "@/types/batch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOperator } from "@/contexts/OperatorContext";

interface BatchCompletionFormProps {
  batch: Batch | null;
  onClose: () => void;
  onSave: (data: {
    batchId: string;
    actualYield: number;
    scrapQuantity: number;
    lotNumber: string;
    materials: Material[];
    operator: string;
  }) => void;
}

export const BatchCompletionForm = ({ batch, onClose, onSave }: BatchCompletionFormProps) => {
  const { operator } = useOperator();
  const [actualYield, setActualYield] = useState(batch?.targetQuantity || 0);
  const [scrapQuantity, setScrapQuantity] = useState(0);
  const [materials, setMaterials] = useState<Material[]>(
    batch?.materials.map(m => ({ ...m, actualQty: m.plannedQty })) || []
  );

  if (!batch) return null;

  const lotNumber = `LOT-${batch.id}-${Date.now().toString().slice(-4)}`;

  const handleMaterialChange = (index: number, value: number) => {
    const updated = [...materials];
    updated[index].actualQty = value;
    setMaterials(updated);
  };

  const handleSave = () => {
    if (!operator) {
      alert("Please select an operator first");
      return;
    }

    onSave({
      batchId: batch.id,
      actualYield,
      scrapQuantity,
      lotNumber,
      materials,
      operator,
    });
  };

  return (
    <Dialog open={!!batch} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Batch: {batch.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="actualYield">Actual Yield *</Label>
              <div className="flex gap-2">
                <Input
                  id="actualYield"
                  type="number"
                  value={actualYield}
                  onChange={(e) => setActualYield(Number(e.target.value))}
                />
                <div className="flex items-center px-3 text-sm text-muted-foreground border rounded-md bg-muted">
                  {batch.uom}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="scrap">Scrap Quantity</Label>
              <div className="flex gap-2">
                <Input
                  id="scrap"
                  type="number"
                  value={scrapQuantity}
                  onChange={(e) => setScrapQuantity(Number(e.target.value))}
                />
                <div className="flex items-center px-3 text-sm text-muted-foreground border rounded-md bg-muted">
                  {batch.uom}
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label>Lot Number (Auto-generated)</Label>
            <Input value={lotNumber} disabled className="bg-muted" />
          </div>

          <div>
            <Label className="mb-2 block">Materials Used</Label>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Planned Qty</TableHead>
                  <TableHead>Actual Qty</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell>{material.plannedQty}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={material.actualQty || 0}
                        onChange={(e) => handleMaterialChange(index, Number(e.target.value))}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>{material.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save & Finish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
