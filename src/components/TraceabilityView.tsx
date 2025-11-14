import { Lot } from "@/types/batch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Package2 } from "lucide-react";

interface TraceabilityViewProps {
  lot: Lot | null;
  onClose: () => void;
}

export const TraceabilityView = ({ lot, onClose }: TraceabilityViewProps) => {
  if (!lot) return null;

  return (
    <Dialog open={!!lot} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Lot Traceability: {lot.lot}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="p-4 bg-accent/50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Product:</span>
                <span className="ml-2 font-medium">{lot.product}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Batch:</span>
                <span className="ml-2 font-medium">{lot.batchId}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Yield:</span>
                <Badge className="ml-2" variant="outline">
                  {lot.yield} L
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Operator:</span>
                <span className="ml-2 font-medium">{lot.operator}</span>
              </div>
            </div>
          </Card>

          <div>
            <h3 className="font-semibold mb-3">Input Materials</h3>
            <div className="space-y-2">
              {lot.inputs.map((input, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package2 className="h-5 w-5 text-primary" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{input.material}</div>
                      <div className="text-sm text-muted-foreground">
                        Used in batch {lot.batchId}
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {input.qty} {input.unit}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card className="p-4 bg-success/10 border-success/20">
            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-success mt-0.5" />
              <div>
                <div className="font-medium text-success-foreground">Final Product</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Lot {lot.lot} - {lot.yield} {lot.inputs[0]?.unit || "L"} of {lot.product}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
