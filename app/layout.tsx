import type { Metadata } from "next"
import { Toaster } from "sonner"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"

export const metadata: Metadata = {
  title: "Capo Community — Task Manager",
  description: "Gerenciador de tarefas para Yomescapo / Capo Community",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex antialiased" style={{ background: "#0a0a0a", color: "#fafafa" }}>
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-60 min-h-screen overflow-x-hidden">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#111111",
              border: "1px solid #222222",
              color: "#fafafa",
            },
          }}
        />
      </body>
    </html>
  )
}
