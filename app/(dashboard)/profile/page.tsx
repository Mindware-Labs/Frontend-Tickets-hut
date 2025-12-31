"use client"

import { useState, useEffect } from "react"
import { useRole } from "@/components/providers/role-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Save } from "lucide-react"
import { settingsApi } from "@/lib/settings-api"
import { useToast } from "@/hooks/use-toast"
import { auth } from "@/lib/auth"

export default function ProfilePage() {
  const { role } = useRole()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const [profile, setProfile] = useState({
    name: "",
    lastName: "",
    email: "",
    avatar: "",
  })

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Check if user is authenticated
    const user = auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      setInitialLoading(true)
      const profileData = await settingsApi.getProfile()
      setProfile({
        name: profileData.name || "",
        lastName: profileData.lastName || "",
        email: profileData.email || "",
        avatar: profileData.avatar || "",
      })
    } catch (error: any) {
      console.error("Failed to load profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      await settingsApi.updateProfile({
        name: profile.name,
        lastName: profile.lastName,
        avatar: profile.avatar,
      })

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error: any) {
      console.error("Failed to save profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  const displayName = `${profile.name} ${profile.lastName}`.trim() || "User"
  const initials = `${profile.name?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() || "U"

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal information and account details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>Update your personal information and details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-border/50">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="font-medium text-lg leading-none">{displayName}</h3>
              <p className="text-sm text-muted-foreground">{role} Account</p>

            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">First Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                placeholder="Doe"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={profile.email}
                  className="pl-9"
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3 pt-4">
        <Button variant="ghost">Cancel</Button>
        <Button onClick={handleSave} disabled={loading} className="btn-primary-modern min-w-[120px]">
          {loading ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

