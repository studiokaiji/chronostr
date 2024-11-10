import { HashRouter, Route, Routes } from "react-router-dom";
import { IndexPage } from "./pages";
import { Container } from "./components/container";
import { AlertContextProvider } from "./contexts/alert-context";
import { EventCalendarPage } from "./pages/events/[naddr]";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { Spinner } from "./components/ui/spinner";
import { NDKContextProvider } from "./contexts/ndk-context";
import { MyPage } from "./pages/mypage";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorBoundaryFallback } from "./components/error-boundary-fallback";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchInterval: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NDKContextProvider>
        <AlertContextProvider>
          <ErrorBoundary fallbackRender={ErrorBoundaryFallback}>
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
                    <Route path="mypage" element={<MyPage />} />
                    <Route path="events">
                      <Route path=":naddr" element={<EventCalendarPage />} />
                    </Route>
                    <Route
                      path="*"
                      element={
                        <div className="text-center pt-4 pb-12 font-semibold text-2xl text-gray-500">
                          Not Found
                        </div>
                      }
                    />
                  </Route>
                </Routes>
              </HashRouter>
            </Suspense>
          </ErrorBoundary>
        </AlertContextProvider>
      </NDKContextProvider>
    </QueryClientProvider>
  );
}

export default App;
