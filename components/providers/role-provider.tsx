"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Role = "Admin" | "Agent"

interface RoleContextType {
    role: Role
    setRole: (role: Role) => void
    isAdmin: boolean
    isAgent: boolean
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: React.ReactNode }) {
    const [role, setRole] = useState<Role>("Admin")

    const value = {
        role,
        setRole,
        isAdmin: role === "Admin",
        isAgent: role === "Agent",
    }

    return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
    const context = useContext(RoleContext)
    if (context === undefined) {
        throw new Error("useRole must be used within a RoleProvider")
    }
    return context
}
