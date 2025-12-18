"use client"

interface ConfirmDialogProps {
  id: string
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  variant?: "danger" | "warning" | "primary"
}

export default function ConfirmDialog({
  id,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  variant = "primary",
}: ConfirmDialogProps) {
  return (
    <div className="modal fade" id={id} tabIndex={-1} aria-labelledby={`${id}Label`} aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id={`${id}Label`}>
              {title}
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              {cancelLabel}
            </button>
            <button type="button" className={`btn btn-${variant}`} onClick={onConfirm} data-bs-dismiss="modal">
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
