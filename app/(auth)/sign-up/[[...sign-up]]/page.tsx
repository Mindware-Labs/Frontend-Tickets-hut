import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <SignUp />
    </div>
  )
}
