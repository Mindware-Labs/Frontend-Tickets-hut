"use client"

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ icon = "bi-inbox", title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center">
      <i className={`bi ${icon} display-1 text-muted mb-3`}></i>
      <h4 className="mb-2">{title}</h4>
      {description && <p className="text-muted mb-3">{description}</p>}
      {actionLabel && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
