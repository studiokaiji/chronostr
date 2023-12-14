import { HashRouter, Route, Routes } from "react-router-dom";
import { IndexPage } from "./pages";
import { Container } from "./components/container";
import { AlertContextProvider } from "./contexts/alert-context";
import { EventCalendarPage } from "./pages/events/[naddr]";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { Spinner } from "./components/ui/spinner";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AlertContextProvider>
        <Suspense
          fallback={
            <div className="flex w-screen h-screen items-center justify-center">
              <Spinner className="w-7 h-7 border-primary" />
            </div>
          }
        >
          <HashRouter>
            <Routes>
              <Route path="/" element={<Container />}>
                <Route index element={<IndexPage />} />
                <Route path="events">
                  <Route path=":naddr" element={<EventCalendarPage />} />
                </Route>
              </Route>
            </Routes>
          </HashRouter>
        </Suspense>
      </AlertContextProvider>
    </QueryClientProvider>
  );
}

export default App;
