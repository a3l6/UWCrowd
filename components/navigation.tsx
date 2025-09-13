"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Heatmap", href: "/heatmap" },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">UW Crowd</span>
          </div>

          <div className="flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-200 relative",
                  pathname === item.href
                    ? "text-primary font-semibold after:absolute after:bottom-[-16px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
