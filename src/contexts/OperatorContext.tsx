import { createContext, useContext, useState, ReactNode } from "react";

interface OperatorContextType {
  operator: string | null;
  setOperator: (operator: string) => void;
}

const OperatorContext = createContext<OperatorContextType | undefined>(undefined);

export const useOperator = () => {
  const context = useContext(OperatorContext);
  if (!context) {
    throw new Error("useOperator must be used within OperatorProvider");
  }
  return context;
};

export const OperatorProvider = ({ children }: { children: ReactNode }) => {
  const [operator, setOperator] = useState<string | null>(null);

  return (
    <OperatorContext.Provider value={{ operator, setOperator }}>
      {children}
    </OperatorContext.Provider>
  );
};
