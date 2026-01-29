import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your TwinHeadSnake account to access algorithmic crypto trading signals.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
