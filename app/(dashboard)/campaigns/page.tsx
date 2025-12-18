"use client"

import { mockCampaigns, mockTickets } from "@/lib/mock-data"
import Link from "next/link"

export default function CampaignsPage() {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Campaigns</h2>
        <button className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>New Campaign
        </button>
      </div>

      <div className="row g-4">
        {mockCampaigns.map((campaign) => {
          const campaignTickets = mockTickets.filter((t) => t.campaign === campaign.name)
          const openTickets = campaignTickets.filter((t) => t.status === "Open").length
          const closedTickets = campaignTickets.filter((t) => t.status === "Closed").length

          return (
            <div key={campaign.id} className="col-lg-6">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="card-title mb-1">{campaign.name}</h5>
                      <small className="text-muted">{campaign.id}</small>
                    </div>
                    <span
                      className={`badge ${
                        campaign.status === "Active"
                          ? "bg-success"
                          : campaign.status === "Paused"
                            ? "bg-warning"
                            : "bg-secondary"
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-4">
                      <div className="text-center p-2 bg-light rounded">
                        <h4 className="mb-0 text-primary">{campaign.ticketCount}</h4>
                        <small className="text-muted">Total Tickets</small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="text-center p-2 bg-light rounded">
                        <h4 className="mb-0 text-info">{openTickets}</h4>
                        <small className="text-muted">Open</small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="text-center p-2 bg-light rounded">
                        <h4 className="mb-0 text-success">{closedTickets}</h4>
                        <small className="text-muted">Closed</small>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted">
                      <i className="bi bi-calendar me-2"></i>
                      Started: {new Date(campaign.startDate).toLocaleDateString()}
                    </small>
                  </div>

                  <div className="d-flex gap-2">
                    <Link href={`/campaigns/${campaign.id}`} className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-eye me-2"></i>View Details
                    </Link>
                    <button className="btn btn-sm btn-outline-secondary">
                      <i className="bi bi-pencil me-2"></i>Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
