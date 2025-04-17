"use client"

import { cn } from "@/lib/utils"
import { BarChart3, FileText, Search, Settings, User, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ModeToggle } from "./mode-toggle"
import { Button } from "./ui/button"
import { useSupabase } from "@/lib/supabase-provider"

const routes = [
  {
    label: "Dashboard",
    icon: BarChart3,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Profiles",
    icon: User,
    href: "/profiles",
    color: "text-violet-500",
  },
  {
    label: "Search",
    icon: Search,
    href: "/search",
    color: "text-pink-700",
  },
  {
    label: "Reports",
    icon: FileText,
    href: "/reports",
    color: "text-orange-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-gray-500",
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { supabase } = useSupabase()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className="flex h-full flex-col space-y-4 bg-background border-r py-4">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-10">
          <h1 className="text-2xl font-bold">Pravaasi</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                pathname === route.href ? "text-primary bg-primary/10" : "text-muted-foreground",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
        <div className="flex items-center justify-between mb-4 px-3">
          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
