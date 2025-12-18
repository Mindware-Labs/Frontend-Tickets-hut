import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <SignIn />
    </div>
  )
}
