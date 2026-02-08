import "./styles/reset.css";
import "./styles/variables.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Feed } from "./components/Feed/Feed";
import styles from "./App.module.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.app}>
        <Feed />
      </div>
    </QueryClientProvider>
  );
}
