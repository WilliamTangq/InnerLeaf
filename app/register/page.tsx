import { Suspense } from "react";
import { RegisterForm } from "../components/auth-card";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
