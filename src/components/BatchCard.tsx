import { Batch } from "@/types/batch";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BatchCardProps {
  batch: Batch;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onComplete: (id: string) => void;
}

const statusConfig = {
  Planned: { color: "bg-muted text-muted-foreground", icon: Clock },
  "In Process": { color: "bg-info text-info-foreground", icon: Play },
  Paused: { color: "bg-warning text-warning-foreground", icon: Pause },
  Completed: { color: "bg-success text-success-foreground", icon: CheckCircle },
};

export const BatchCard = ({ batch, onStart, onPause, onComplete }: BatchCardProps) => {
  const config = statusConfig[batch.status];
  const StatusIcon = config.icon;

  const formatTime = (time?: string) => {
    if (!time) return "-";
    return new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getElapsedTime = () => {
    if (!batch.startTime) return null;
    const start = new Date(batch.startTime).getTime();
    const end = batch.pauseTime ? new Date(batch.pauseTime).getTime() : Date.now();
    const elapsed = Math.floor((end - start) / 1000 / 60); // minutes
    return `${Math.floor(elapsed / 60)}h ${elapsed % 60}m`;
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">{batch.id}</h3>
          <p className="text-sm text-muted-foreground">{batch.productName}</p>
        </div>
        <Badge className={cn("gap-1", config.color)}>
          <StatusIcon className="h-3 w-3" />
          {batch.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div>
          <span className="text-muted-foreground">Target:</span>
          <span className="ml-2 font-medium">
            {batch.targetQuantity} {batch.uom}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Start:</span>
          <span className="ml-2 font-medium">{formatTime(batch.startTime)}</span>
        </div>
        {batch.status === "In Process" && getElapsedTime() && (
          <div className="col-span-2">
            <span className="text-muted-foreground">Elapsed:</span>
            <span className="ml-2 font-medium text-info">{getElapsedTime()}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {batch.status === "Planned" && (
          <Button onClick={() => onStart(batch.id)} className="flex-1" size="sm">
            <Play className="h-4 w-4 mr-1" />
            Start
          </Button>
        )}
        {batch.status === "In Process" && (
          <>
            <Button
              onClick={() => onPause(batch.id)}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
            <Button onClick={() => onComplete(batch.id)} className="flex-1" size="sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              Complete
            </Button>
          </>
        )}
        {batch.status === "Paused" && (
          <Button onClick={() => onStart(batch.id)} className="flex-1" size="sm">
            <Play className="h-4 w-4 mr-1" />
            Resume
          </Button>
        )}
      </div>

      {batch.operator && (
        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
          Operator: {batch.operator}
        </div>
      )}
    </Card>
  );
};
