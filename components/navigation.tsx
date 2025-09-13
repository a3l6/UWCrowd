"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Heatmap", href: "/heatmap" },
  { name: "About", href: "/about" },

]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-[#14213D] border-b border-[#14213D] shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:scale-110 transition-transform duration-200 cursor-pointer">
            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-[#FCA311] rounded-lg">
              <MapPin className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-white">
              <span style={{ color: '#FCA311' }}>UW </span>
              <span style={{ color: '#FFFFFF' }}>Crowd</span>
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-xs sm:text-sm font-medium transition-colors duration-200 relative",
                  pathname === item.href
                    ? "text-white font-semibold after:absolute after:bottom-[-16px] after:left-0 after:right-0 after:h-0.5 after:bg-[#FCA311]"
                    : "text-[#E5E5E5] hover:text-white",
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
