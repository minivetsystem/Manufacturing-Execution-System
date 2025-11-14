import { Lot } from "@/types/batch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

interface ProductionHistoryProps {
  lots: Lot[];
  onSelectLot: (lot: Lot) => void;
}

export const ProductionHistory = ({ lots, onSelectLot }: ProductionHistoryProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Production History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lots.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No completed batches yet
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lot Number</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Batch ID</TableHead>
                <TableHead>Yield</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lots.map((lot) => (
                <TableRow key={lot.lot}>
                  <TableCell className="font-mono font-medium">{lot.lot}</TableCell>
                  <TableCell>{lot.product}</TableCell>
                  <TableCell>{lot.batchId}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{lot.yield} L</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{lot.operator}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(lot.completedAt)}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => onSelectLot(lot)}
                      className="text-primary hover:underline text-sm"
                    >
                      View Traceability
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
