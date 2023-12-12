import { alertContext, setAlertContext } from "@/contexts/alert-context";
import { useContext } from "react";

export const useAlert = () => {
  const alert = useContext(alertContext);
  const setAlert = useContext(setAlertContext);
  return { alert, setAlert };
};
