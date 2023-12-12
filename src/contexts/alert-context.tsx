import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from "react";

type AlertPayload = {
  variant?: "default" | "destructive";
  title: string;
  description?: string;
  icon?: ReactNode;
  lifetimeMs?: number;
};

export const alertContext = createContext<AlertPayload | null>(null);
export const setAlertContext = createContext<
  Dispatch<SetStateAction<AlertPayload | null>>
>(() => undefined);

export const AlertContextProvider = ({ children }: { children: ReactNode }) => {
  const [alert, setAlert] = useState<AlertPayload | null>(null);

  useEffect(() => {
    if (!alert) {
      return;
    }

    const timeout = setTimeout(() => {
      setAlert(null);
    }, alert.lifetimeMs || 4000);

    return () => clearTimeout(timeout);
  }, [alert]);

  return (
    <alertContext.Provider value={alert}>
      <setAlertContext.Provider value={setAlert}>
        <div
          className={`fixed right-4 bottom-4 transition ${
            alert ? "visible z-50" : "invisible select-none -z-50"
          }`}
        >
          <Alert variant={alert?.variant} className="bg-background">
            {alert?.icon}
            <AlertTitle>{alert?.title}</AlertTitle>
            <AlertDescription>{alert?.description}</AlertDescription>
          </Alert>
        </div>
        {children}
      </setAlertContext.Provider>
    </alertContext.Provider>
  );
};
