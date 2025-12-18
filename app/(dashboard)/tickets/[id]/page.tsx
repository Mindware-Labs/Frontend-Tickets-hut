"use client"

import { mockTickets } from "@/lib/mock-data"
import { notFound } from "next/navigation"
import Link from "next/link"

interface TicketDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = await params
  const ticket = mockTickets.find((t) => t.id === id)

  if (!ticket) {
    notFound()
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link href="/tickets" className="text-decoration-none text-muted mb-2 d-block">
            <i className="bi bi-arrow-left me-2"></i>Back to Tickets
          </Link>
          <h2>{ticket.id}</h2>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary">
            <i className="bi bi-pencil me-2"></i>Edit
          </button>
          <button className="btn btn-success">
            <i className="bi bi-check-circle me-2"></i>Mark as Closed
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Client Information */}
        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-person me-2"></i>Client Information
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="text-muted small">Name</label>
                <p className="mb-0 fw-semibold">{ticket.clientName}</p>
              </div>
              <div className="mb-3">
                <label className="text-muted small">Phone</label>
                <p className="mb-0">{ticket.phone}</p>
              </div>
              <div className="mb-3">
                <label className="text-muted small">Status</label>
                <div>
                  <span
                    className={`badge ${
                      ticket.status === "Open"
                        ? "badge-open"
                        : ticket.status === "In Progress"
                          ? "badge-in-progress"
                          : "badge-closed"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
              </div>
              <div className="mb-0">
                <label className="text-muted small">Priority</label>
                <div>
                  <span
                    className={`badge ${
                      ticket.priority === "High"
                        ? "bg-danger"
                        : ticket.priority === "Medium"
                          ? "bg-warning"
                          : "bg-secondary"
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Call Information */}
          <div className="card">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-telephone me-2"></i>Call Information
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="text-muted small">Aircall ID</label>
                <p className="mb-0 font-monospace">{ticket.aircallId}</p>
              </div>
              <div className="mb-3">
                <label className="text-muted small">Call Duration</label>
                <p className="mb-0">{ticket.callDuration}</p>
              </div>
              <div className="mb-0">
                <label className="text-muted small">Created Date</label>
                <p className="mb-0">{new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="col-lg-8">
          {/* Ticket Metadata */}
          <div className="card mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-ticket-perforated me-2"></i>Ticket Details
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="text-muted small">Type</label>
                  <p className="mb-0">
                    <span className={`badge ${ticket.type === "Onboarding" ? "bg-info" : "bg-warning"}`}>
                      {ticket.type}
                    </span>
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="text-muted small">Campaign</label>
                  <p className="mb-0">{ticket.campaign}</p>
                </div>
                <div className="col-md-6 mb-0">
                  <label className="text-muted small">Assigned To</label>
                  <p className="mb-0">{ticket.assignedTo || "Unassigned"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>Timeline
              </h5>
            </div>
            <div className="card-body">
              <div className="timeline">
                <div className="timeline-item d-flex mb-3">
                  <div className="timeline-marker bg-primary"></div>
                  <div className="ms-3">
                    <p className="mb-1 fw-semibold">Ticket Created</p>
                    <small className="text-muted">{new Date(ticket.createdAt).toLocaleString()}</small>
                    <p className="mb-0 mt-1 small">Ticket automatically created from Aircall</p>
                  </div>
                </div>
                {ticket.assignedTo && (
                  <div className="timeline-item d-flex mb-3">
                    <div className="timeline-marker bg-info"></div>
                    <div className="ms-3">
                      <p className="mb-1 fw-semibold">Assigned</p>
                      <small className="text-muted">
                        {new Date(new Date(ticket.createdAt).getTime() + 3600000).toLocaleString()}
                      </small>
                      <p className="mb-0 mt-1 small">Ticket assigned to {ticket.assignedTo}</p>
                    </div>
                  </div>
                )}
                {ticket.status === "Closed" && (
                  <div className="timeline-item d-flex">
                    <div className="timeline-marker bg-success"></div>
                    <div className="ms-3">
                      <p className="mb-1 fw-semibold">Closed</p>
                      <small className="text-muted">
                        {new Date(new Date(ticket.createdAt).getTime() + 7200000).toLocaleString()}
                      </small>
                      <p className="mb-0 mt-1 small">Ticket marked as closed</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="card mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-chat-left-text me-2"></i>Comments
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <textarea className="form-control" rows={3} placeholder="Add a comment..."></textarea>
              </div>
              <button className="btn btn-primary">
                <i className="bi bi-send me-2"></i>Post Comment
              </button>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="card">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-paperclip me-2"></i>Attachments
              </h5>
            </div>
            <div className="card-body">
              <div className="border-2 border-dashed rounded p-4 text-center">
                <i className="bi bi-cloud-upload fs-2 text-muted"></i>
                <p className="text-muted mb-0 mt-2">Drop files here or click to upload</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .timeline-marker {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 4px;
        }
      `}</style>
    </div>
  )
}
