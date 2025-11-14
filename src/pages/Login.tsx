import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOperator } from "@/contexts/OperatorContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const operators = ["John Smith", "Maria Garcia", "David Chen", "Sarah Johnson", "Ahmed Hassan"];

export default function Login() {
  const [selectedOperator, setSelectedOperator] = useState<string>("");
  const { setOperator } = useOperator();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = () => {
    if (!selectedOperator) {
      toast({
        title: "Operator Required",
        description: "Please select an operator to continue",
        variant: "destructive",
      });
      return;
    }

    setOperator(selectedOperator);
    toast({
      title: "Welcome!",
      description: `Logged in as ${selectedOperator}`,
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">MES Login</CardTitle>
          <CardDescription className="text-center">
            Select your operator profile to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Operator</label>
            <Select value={selectedOperator} onValueChange={setSelectedOperator}>
              <SelectTrigger>
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
          <Button onClick={handleLogin} className="w-full">
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
