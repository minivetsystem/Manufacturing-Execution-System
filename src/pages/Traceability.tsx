import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useManufacturing } from "@/contexts/ManufacturingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Package, ArrowRight, Network } from "lucide-react";
import ReactFlow, { Node, Edge, Background, Controls, MarkerType } from "reactflow";
import "reactflow/dist/style.css";

const Traceability = () => {
  const navigate = useNavigate();
  const { lots } = useManufacturing();
  const [selectedLot, setSelectedLot] = useState<string | null>(null);

  const selectedLotData = lots.find((l) => l.lot === selectedLot);

  const formatDateTime = (time: string) => {
    return new Date(time).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const { nodes, edges } = useMemo(() => {
    if (!selectedLotData) return { nodes: [], edges: [] };

    const graphNodes: Node[] = [];
    const graphEdges: Edge[] = [];

    // Create lot node (rightmost)
    graphNodes.push({
      id: selectedLotData.lot,
      data: { label: `${selectedLotData.lot}\n${selectedLotData.product}\n${selectedLotData.yield} ${selectedLotData.batchId.includes("L") ? "L" : "kg"}` },
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
      id: selectedLotData.batchId,
      data: { label: `Batch\n${selectedLotData.batchId}` },
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
    selectedLotData.inputs.forEach((input, index) => {
      const materialId = `${input.material}-${index}`;
      const yOffset = index * 100 - ((selectedLotData.inputs.length - 1) * 50);
      
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
        id: `${materialId}-${selectedLotData.batchId}`,
        source: materialId,
        target: selectedLotData.batchId,
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
      id: `${selectedLotData.batchId}-${selectedLotData.lot}`,
      source: selectedLotData.batchId,
      target: selectedLotData.lot,
      animated: true,
      style: { stroke: "hsl(var(--primary))", strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "hsl(var(--primary))",
      },
    });

    return { nodes: graphNodes, edges: graphEdges };
  }, [selectedLotData]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Lot Traceability</h1>
              <p className="text-sm text-muted-foreground">
                Track finished goods and their input materials
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Completed Lots</CardTitle>
            </CardHeader>
            <CardContent>
              {lots.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No completed lots yet
                </p>
              ) : (
                <div className="space-y-2">
                  {lots.map((lot) => (
                    <Button
                      key={lot.lot}
                      variant={selectedLot === lot.lot ? "default" : "outline"}
                      className="w-full justify-between"
                      onClick={() => setSelectedLot(lot.lot)}
                    >
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span className="font-mono">{lot.lot}</span>
                      </div>
                      <Badge variant="secondary">{lot.product}</Badge>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedLotData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Lot Details: {selectedLotData.lot}
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
                        <p className="font-medium">{selectedLotData.product}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Yield</p>
                        <p className="font-medium">{selectedLotData.yield}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Batch ID</p>
                        <p className="font-medium">{selectedLotData.batchId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Operator</p>
                        <p className="font-medium">{selectedLotData.operator}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Completed At</p>
                        <p className="font-medium">{formatDateTime(selectedLotData.completedAt)}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Input Materials</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Material</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead>UOM</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedLotData.inputs.map((input, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{input.material}</TableCell>
                              <TableCell className="text-right">{input.qty}</TableCell>
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
                        {selectedLotData.inputs.map((input, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Badge variant="outline">{input.material}</Badge>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <Badge variant="outline">{selectedLotData.batchId}</Badge>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <Badge>{selectedLotData.lot}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="graph" className="h-[500px] border rounded-lg">
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
          )}
        </div>
      </main>
    </div>
  );
};

export default Traceability;
