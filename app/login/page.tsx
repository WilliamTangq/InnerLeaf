import { Suspense } from "react";
import { LoginForm } from "../components/auth-card";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
