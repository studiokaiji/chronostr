import { useAlert } from "@/hooks/use-alert";
import { useEffect } from "react";
import { FallbackProps } from "react-error-boundary";
import { useNavigate } from "react-router-dom";

export const ErrorBoundaryFallback = (
  props: FallbackProps & { redirectTo?: string }
) => {
  const { setAlert } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    if (props.error) {
      setAlert({
        title: "An error occurred",
        description: props.error.message,
        variant: "destructive",
      });
      if (props.redirectTo) {
        navigate(props.redirectTo, { replace: true });
      }
    }
  }, [navigate, props.error, props.redirectTo, setAlert]);

  return <></>;
};
