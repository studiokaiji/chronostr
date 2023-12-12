import { HashRouter, Route, Routes } from "react-router-dom";
import { IndexPage } from "./pages";
import { Container } from "./components/container";
import { AlertContextProvider } from "./contexts/alert-context";

function App() {
  return (
    <AlertContextProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Container />}>
            <Route index element={<IndexPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AlertContextProvider>
  );
}

export default App;
