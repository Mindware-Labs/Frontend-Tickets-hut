"use client"

import { useState } from "react"
import { useRole } from "@/components/providers/role-provider"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Bell,
  User,
  Shield,
  Laptop,
  Mail,
  Save,
  Globe,
  Lock
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  const { role, isAdmin } = useRole()
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(false)

  // Mock State
  const [siteName, setSiteName] = useState("My Workspace")
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [pushNotifs, setPushNotifs] = useState(false)

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      // In a real app, use toast here
      alert("Settings saved successfully")
    }, 1000)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account preferences and system configurations.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-1 border border-border/50">
          <TabsTrigger value="general" className="data-[state=active]:bg-secondary">
            <User className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-secondary">
          </TabsTrigger>
          <TabsTrigger value="display" className="data-[state=active]:bg-secondary">
            <Laptop className="mr-2 h-4 w-4" />
            Display
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="security" className="data-[state=active]:bg-secondary">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
          )}
        </TabsList>

        {/* --- GENERAL TAB --- */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid gap-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your public profile and details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 border-2 border-border/50">
                    <AvatarImage src="/avatars/shadcn.jpg" />
                    <AvatarFallback className="text-lg">JD</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="font-medium text-lg leading-none">John Doe</h3>
                    <p className="text-sm text-muted-foreground">{role} Account</p>
                    <Button variant="outline" size="sm" className="mt-2 h-8">Change Avatar</Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input defaultValue="Gerald Luciano" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input defaultValue="john@example.com" className="pl-9" disabled />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workspace Card (Admin Only) */}
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>Workspace Settings</CardTitle>
                  <CardDescription>Manage your organization's display settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Workspace Name</Label>
                    <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English (US)</SelectItem>
                        <SelectItem value="es">Spanish (ES)</SelectItem>
                        <SelectItem value="fr">French (FR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

   
        {/* --- DISPLAY TAB --- */}
        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the interface look and feel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div
                  onClick={() => setTheme("light")}
                  className="space-y-2 cursor-pointer group"
                >
                  <div className={cn(
                    "h-32 rounded-lg border-2 bg-background p-2 transition-all",
                    theme === "light" ? "border-primary shadow-lg" : "border-muted group-hover:border-primary/50"
                  )}>
                    <div className="h-full w-full rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                      <span className="text-xs font-medium text-zinc-900">Light</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-center">Light</p>
                </div>

                <div
                  onClick={() => setTheme("dark")}
                  className="space-y-2 cursor-pointer group"
                >
                  <div className={cn(
                    "h-32 rounded-lg border-2 bg-background p-2 transition-all",
                    theme === "dark" ? "border-primary shadow-lg" : "border-muted group-hover:border-primary/50"
                  )}>
                    <div className="h-full w-full rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <span className="text-xs font-medium text-zinc-100">Dark</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-center">Dark</p>
                </div>

                <div
                  onClick={() => setTheme("system")}
                  className="space-y-2 cursor-pointer group"
                >
                  <div className={cn(
                    "h-32 rounded-lg border-2 bg-background p-2 transition-all",
                    theme === "system" ? "border-primary shadow-lg" : "border-muted group-hover:border-primary/50"
                  )}>
                    <div className="h-full w-full rounded-md bg-gradient-to-br from-zinc-100 to-zinc-900 border border-zinc-200 flex items-center justify-center">
                      <span className="text-xs font-medium text-zinc-500 bg-background/50 px-2 py-1 rounded">System</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-center">System</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- SECURITY TAB (ADMIN ONLY) --- */}
        {isAdmin && (
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage access and security protocols.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="flex gap-2">
                    <Input type="password" value="********" disabled className="max-w-[300px]" />
                    <Button variant="outline">Change Password</Button>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <Label className="text-base font-medium leading-none">Two-Factor Authentication</Label>
                    <span className="text-sm text-muted-foreground">Add an extra layer of security to your account.</span>
                  </div>
                  <Button variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

      </Tabs>

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
