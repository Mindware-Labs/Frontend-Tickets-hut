"use client"

import { mockUsers } from "@/lib/mock-data"

export default function UsersPage() {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Users</h2>
        <button className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>Add User
        </button>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Tickets Assigned</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                          style={{ width: "36px", height: "36px" }}
                        >
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <span className="fw-semibold">{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === "Admin" ? "bg-danger" : user.role === "Supervisor" ? "bg-warning" : "bg-info"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>{user.ticketsAssigned}</td>
                    <td>
                      <span className={`badge ${user.status === "Active" ? "bg-success" : "bg-secondary"}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="dropdown table-actions">
                        <button
                          className="btn btn-sm btn-light dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <button className="dropdown-item">
                              <i className="bi bi-eye me-2"></i>View Profile
                            </button>
                          </li>
                          <li>
                            <button className="dropdown-item">
                              <i className="bi bi-pencil me-2"></i>Edit
                            </button>
                          </li>
                          <li>
                            <button className="dropdown-item">
                              <i className="bi bi-key me-2"></i>Reset Password
                            </button>
                          </li>
                          <li>
                            <hr className="dropdown-divider" />
                          </li>
                          <li>
                            <button className="dropdown-item text-danger">
                              <i className="bi bi-trash me-2"></i>Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="row g-4 mt-2">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="text-primary">{mockUsers.length}</h3>
              <p className="text-muted mb-0">Total Users</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="text-success">{mockUsers.filter((u) => u.status === "Active").length}</h3>
              <p className="text-muted mb-0">Active</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="text-info">{mockUsers.filter((u) => u.role === "Agent").length}</h3>
              <p className="text-muted mb-0">Agents</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="text-warning">{mockUsers.filter((u) => u.role === "Supervisor").length}</h3>
              <p className="text-muted mb-0">Supervisors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
