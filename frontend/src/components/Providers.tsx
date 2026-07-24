"use client";

import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ApolloWrapper } from "@/lib/ApolloWrapper";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0f4c5c" },
    secondary: { main: "#e36414" },
    background: { default: "#f4f7f8", paper: "#ffffff" },
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ApolloWrapper>{children}</ApolloWrapper>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
