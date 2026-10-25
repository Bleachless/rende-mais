import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({ variable: "--font-sora", subsets: ["latin"] });
const plex = IBM_Plex_Mono({ variable: "--font-plex", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Rende Mais · CDB, LCI, Tesouro ou poupança: quanto rende de verdade",
  description:
    "Compare poupança, CDB, LCI/LCA, Tesouro Selic, Tesouro IPCA+, fundo DI e prefixado com as taxas de hoje do Banco Central, já com IR, come-cotas, custódia e inflação. Ou veja quanto guardar por mês para bater a sua meta.",
  applicationName: "Rende Mais",
};

export const viewport: Viewport = { themeColor: "#0a0d12", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${plex.variable} antialiased`}>
      <body className="min-h-screen overflow-x-hidden font-sans">{children}</body>
    </html>
  );
}
