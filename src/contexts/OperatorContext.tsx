import { createContext, useContext, useState, ReactNode } from "react";

interface OperatorContextType {
  operator: string | null;
  setOperator: (operator: string) => void;
  logout: () => void;
}

const OperatorContext = createContext<OperatorContextType | undefined>(undefined);
// eslint-disable-next-line react-hooks/rules-of-hooks

 



export const OperatorProvider = ({ children }: { children: ReactNode }) => {
  const [operator, setOperator] = useState<string | null>(localStorage.getItem("operator"));
 

  const handleSetOperator = (name: string) => {
    setOperator(name);
    localStorage.setItem("operator", name);
  };

  const logout = () => {
    setOperator(null);
    localStorage.removeItem("operator");
  };

  return (
    <OperatorContext.Provider value={{ operator, setOperator: handleSetOperator, logout }}>
      {children}
    </OperatorContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useOperator = () => {
  const context = useContext(OperatorContext);
  if (context === undefined) {
    throw new Error("useOperator must be used within OperatorProvider");
  }
  return context;
};
