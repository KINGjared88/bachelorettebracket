import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { AppData } from "@/types";
import { loadAppData } from "@/lib/data-loader";

const defaultData: AppData = {
  players: [],
  picks: [],
  results: [],
  contestants: [],
  announcements: [],
  lastUpdated: null,
  loading: true,
  error: null,
  csvErrors: [],
};

const DataContext = createContext<{
  data: AppData;
  refresh: () => void;
}>({ data: defaultData, refresh: () => {} });

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData);

  const refresh = useCallback(async () => {
    setData((d) => ({ ...d, loading: true, error: null, csvErrors: [] }));
    const result = await loadAppData();
    setData(result);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <DataContext.Provider value={{ data, refresh }}>
      {children}
    </DataContext.Provider>
  );
}

export function useAppData() {
  return useContext(DataContext);
}
