import { useOperator } from "@/contexts/OperatorContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";

const operators = ["John Smith", "Maria Garcia", "David Chen", "Sarah Johnson", "Ahmed Hassan"];

export const OperatorSelect = () => {
  const { operator, setOperator } = useOperator();

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        <span>Operator:</span>
      </div>
      <Select value={operator || ""} onValueChange={setOperator}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select operator" />
        </SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op} value={op}>
              {op}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
