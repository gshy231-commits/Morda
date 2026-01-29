"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/authContext";
import { DataProvider } from "@/lib/dataContext";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <DataProvider>
        {children}
      </DataProvider>
    </AuthProvider>
  );
}
