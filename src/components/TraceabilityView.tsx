import { Lot } from "@/types/batch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Network, Package2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useManufacturing } from "@/contexts/ManufacturingContext";
import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import ReactFlow, { Background, Controls, MarkerType } from "reactflow";

interface TraceabilityViewProps {
  lot: Lot | null;
  onClose: () => void;
}

export const TraceabilityView = ({ lot, onClose }: TraceabilityViewProps) => {

  console.log(lot)
  const { nodes, edges } = useMemo(() => {
    if (!lot) return { nodes: [], edges: [] };

    const graphNodes: Node[] = [];
    const graphEdges: Edge[] = [];

    // Create lot node (rightmost)
    graphNodes.push({
      id: lot?.lot,
      data: {
        label: `${lot?.lot}\n${lot?.product}\n${lot?.yield} ${
          lot?.batchId.includes("L") ? "L" : "kg"
        }`,
      },
      position: { x: 600, y: 150 },
      style: {
        background: "hsl(var(--primary))",
        color: "hsl(var(--primary-foreground))",
        border: "2px solid hsl(var(--primary))",
        borderRadius: "8px",
        padding: "16px",
        fontWeight: "bold",
        fontSize: "12px",
        textAlign: "center",
        whiteSpace: "pre-line",
        width: 180,
      },
    });

    // Create batch node (middle)
    graphNodes.push({
      id: lot.batchId,
      data: { label: `Batch\n${lot.batchId}` },
      position: { x: 350, y: 150 },
      style: {
        background: "hsl(var(--secondary))",
        color: "hsl(var(--secondary-foreground))",
        border: "2px solid hsl(var(--border))",
        borderRadius: "8px",
        padding: "16px",
        fontWeight: "600",
        fontSize: "12px",
        textAlign: "center",
        whiteSpace: "pre-line",
        width: 150,
      },
    });

    // Create material nodes (leftmost) and edges
    lot.inputs.forEach((input, index) => {
      const materialId = `${input.material}-${index}`;
      const yOffset = index * 100 - (lot.inputs.length - 1) * 50;

      graphNodes.push({
        id: materialId,
        data: { label: `${input.material}\n${input.qty} ${input.unit}` },
        position: { x: 50, y: 150 + yOffset },
        style: {
          background: "hsl(var(--muted))",
          color: "hsl(var(--foreground))",
          border: "2px solid hsl(var(--border))",
          borderRadius: "8px",
          padding: "12px",
          fontSize: "11px",
          textAlign: "center",
          whiteSpace: "pre-line",
          width: 140,
        },
      });

      // Material -> Batch edge
      graphEdges.push({
        id: `${materialId}-${lot.batchId}`,
        source: materialId,
        target: lot.batchId,
        animated: true,
        style: { stroke: "hsl(var(--muted-foreground))", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "hsl(var(--muted-foreground))",
        },
      });
    });

    // Batch -> Lot edge
    graphEdges.push({
      id: `${lot.batchId}-${lot.lot}`,
      source: lot.batchId,
      target: lot.lot,
      animated: true,
      style: { stroke: "hsl(var(--primary))", strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "hsl(var(--primary))",
      },
    });

    return { nodes: graphNodes, edges: graphEdges };
  }, [lot]);
  const formatDateTime = (time: string) => {
    return new Date(time).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Lot Details: {lot?.lot}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details & Table</TabsTrigger>
                  <TabsTrigger value="graph">Network Graph</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Product</p>
                      <p className="font-medium">{lot?.product}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Yield</p>
                      <p className="font-medium">{lot?.yield}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Batch ID</p>
                      <p className="font-medium">{lot?.batchId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Operator</p>
                      <p className="font-medium">{lot?.operator}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">
                        Completed At
                      </p>
                      <p className="font-medium">
                        {formatDateTime(lot?.completedAt)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Input Materials</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lot?.inputs.map((input, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {input.material}
                            </TableCell>
                            <TableCell className="text-right">
                              {input.qty}
                            </TableCell>
                            <TableCell>{input.unit}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      Material Flow
                    </h4>
                    <div className="space-y-2 text-sm">
                      {lot?.inputs.map((input, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="outline">{input.material}</Badge>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline">{lot.batchId}</Badge>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <Badge>{lot.lot}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="graph"
                  className="h-[500px] border rounded-lg"
                >
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    fitView
                    attributionPosition="bottom-left"
                  >
                    <Background />
                    <Controls />
                  </ReactFlow>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
