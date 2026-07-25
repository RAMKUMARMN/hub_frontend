import { redirect } from "next/navigation";

// Root page — redirect to dashboard
export default function HomePage() {
  redirect("/dashboard");
}
