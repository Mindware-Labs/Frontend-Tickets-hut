"use client"

import type React from "react"
import { useEffect, useRef } from "react"

interface ModalProps {
  id: string
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
}

export default function Modal({ id, title, children, footer, size = "md" }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Bootstrap modal initialization can go here if needed
  }, [])

  return (
    <div className="modal fade" id={id} tabIndex={-1} aria-labelledby={`${id}Label`} aria-hidden="true" ref={modalRef}>
      <div className={`modal-dialog modal-${size}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id={`${id}Label`}>
              {title}
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
