import { redirect } from "next/navigation";

// Root page - redirect to the mock dashboard until backend APIs are available.
export default function HomePage() {
  redirect("/dashboard");
}
