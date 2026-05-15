import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { Navigation } from "@/components/Navigation";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            <Component {...pageProps} />
          </main>
        </div>
      </LocaleProvider>
    </ThemeProvider>
  );
}