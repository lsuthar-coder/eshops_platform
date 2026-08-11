import { useEffect, useState } from "react";
import AuroraBackground from "./components/AuroraBackground";
import LoaderScreen from "./components/LoaderScreen";
import StoreNotFound from "./components/StoreNotFound";
import HomePage from "./pages/HomePage";
import { getStoreConfig, StoreNotFoundError } from "./api/storeApi";

export default function App() {
  const [config, setConfig] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoreConfig()
      .then(setConfig)
      .catch((err) => {
        if (err instanceof StoreNotFoundError) {
          setNotFound(true);
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col">
      <AuroraBackground />

      {loading && <LoaderScreen />}

      {!loading && notFound && <StoreNotFound />}

      {!loading && error && (
        <div className="relative z-10 flex flex-1 items-center justify-center px-6 text-center">
          <p className="text-sm text-[var(--color-aurora-amber)]">{error}</p>
        </div>
      )}

      {!loading && !notFound && !error && config && <HomePage config={config} />}
    </div>
  );
}
