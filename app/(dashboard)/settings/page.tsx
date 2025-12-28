"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { settingsApi } from "@/lib/settings-api"
import { useToast } from "@/hooks/use-toast"
import { Save, Palette, Monitor, Sun, Moon } from "lucide-react"

const COLOR_OPTIONS = [
  { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
  { value: 'green', label: 'Green', color: 'bg-green-500' },
  { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
  { value: 'red', label: 'Red', color: 'bg-red-500' },
  { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
  { value: 'cyan', label: 'Cyan', color: 'bg-cyan-500' },
]

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [preferences, setPreferences] = useState({
    theme: "system",
    primaryColor: "blue",
  })

  function applyPrimaryColor(color: string) {
    // Store in localStorage
    localStorage.setItem('primaryColor', color)
    
    // Update CSS variables based on color
    const root = document.documentElement
    const colorMap: Record<string, { hue: string; saturation: string; lightness: string }> = {
      blue: { hue: '221.2', saturation: '83.2', lightness: '53.9' },
      green: { hue: '142.1', saturation: '76.4', lightness: '45.1' },
      purple: { hue: '262.1', saturation: '83.3', lightness: '57.8' },
      red: { hue: '0', saturation: '84.2', lightness: '60.2' },
      orange: { hue: '24.6', saturation: '95', lightness: '53.1' },
      cyan: { hue: '188.7', saturation: '85.1', lightness: '53.3' },
    }

    const colorConfig = colorMap[color] || colorMap.blue
    // Update primary color (light mode)
    root.style.setProperty('--primary', `${colorConfig.hue} ${colorConfig.saturation}% ${colorConfig.lightness}%`)
    
    // Update dark mode primary (slightly brighter)
    const darkLightness = Math.min(parseFloat(colorConfig.lightness) + 10, 70).toFixed(1)
    root.style.setProperty('--primary-dark', `${colorConfig.hue} ${colorConfig.saturation}% ${darkLightness}%`)
  }

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    loadSettings()
    // Apply color from localStorage on mount
    const savedColor = localStorage.getItem('primaryColor')
    if (savedColor) {
      applyPrimaryColor(savedColor)
    }
  }, [])

  async function loadSettings() {
    try {
      setInitialLoading(true)
      const prefs = await settingsApi.getPreferences()
      setPreferences({
        theme: prefs.theme || "system",
        primaryColor: prefs.primaryColor || "blue",
      })
      // Sync theme with preferences
      if (prefs.theme && prefs.theme !== theme) {
        setTheme(prefs.theme as "light" | "dark" | "system")
      }
      // Apply primary color
      if (prefs.primaryColor) {
        applyPrimaryColor(prefs.primaryColor)
      } else {
        // Apply color from localStorage if available
        const savedColor = localStorage.getItem('primaryColor')
        if (savedColor) {
          applyPrimaryColor(savedColor)
          setPreferences(prev => ({ ...prev, primaryColor: savedColor }))
        }
      }
    } catch (error: any) {
      console.error("Failed to load settings:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setInitialLoading(false)
    }
  }


  const handleSave = async () => {
    try {
      setLoading(true)

      await settingsApi.updatePreferences({
        theme: theme as string,
        primaryColor: preferences.primaryColor,
      })

      // Apply primary color
      applyPrimaryColor(preferences.primaryColor)

      toast({
        title: "Success",
        description: "Settings saved successfully",
      })
    } catch (error: any) {
      console.error("Failed to save settings:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    setPreferences({ ...preferences, theme: newTheme })
  }

  const handleColorChange = (color: string) => {
    setPreferences({ ...preferences, primaryColor: color })
    // Apply color immediately for preview
    applyPrimaryColor(color)
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">System Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize the appearance and behavior of your system.
        </p>
      </div>

      <div className="space-y-6">
        {/* Primary Color */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>Primary Color</CardTitle>
            </div>
            <CardDescription>
              Choose the primary color theme for the system interface.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
              {COLOR_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleColorChange(option.value)}
                  className="space-y-2 cursor-pointer group"
                >
                  <div
                    className={cn(
                      "h-16 rounded-lg border-2 transition-all flex items-center justify-center",
                      preferences.primaryColor === option.value
                        ? "border-primary shadow-lg scale-105"
                        : "border-muted group-hover:border-primary/50"
                    )}
                  >
                    <div className={cn("w-12 h-12 rounded-full", option.color)} />
                  </div>
                  <p className="text-sm font-medium text-center">{option.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              <CardTitle>Theme</CardTitle>
            </div>
            <CardDescription>
              Choose your preferred theme for the interface.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {THEME_OPTIONS.map((option) => {
                const IconComponent = option.icon;
                return (
                  <div
                    key={option.value}
                    onClick={() => handleThemeChange(option.value as "light" | "dark" | "system")}
                    className="space-y-2 cursor-pointer group"
                  >
                    <div
                      className={cn(
                        "h-24 rounded-lg border-2 bg-background p-4 transition-all flex flex-col items-center justify-center",
                        theme === option.value
                          ? "border-primary shadow-lg"
                          : "border-muted group-hover:border-primary/50"
                      )}
                    >
                      <IconComponent className="h-6 w-6 mb-2 text-foreground" />
                      <span className="text-xs font-medium">{option.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

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
