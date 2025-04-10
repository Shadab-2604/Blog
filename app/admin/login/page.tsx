export const dynamic = "force-dynamic"

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <LoginForm />
    </div>
  )
}

