interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
}

export default function LoadingSpinner({ size = "md", text = "Loading..." }: LoadingSpinnerProps) {
  const spinnerClass = size === "sm" ? "spinner-border-sm" : size === "lg" ? "spinner-border-lg" : ""

  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-5">
      <div className={`spinner-border text-primary ${spinnerClass}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && <p className="mt-3 text-muted">{text}</p>}
    </div>
  )
}
