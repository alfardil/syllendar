'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Home, 
  Upload, 
  Calendar, 
  BarChart3,
  BookOpen,
  Menu,
  X
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Grades', href: '/grades', icon: BarChart3 },
  { name: 'Resources', href: '/resources', icon: BookOpen },
]

export default function NeoBrutalistLayout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-yellow-100">
      {/* Navigation */}
      <nav className="bg-white border-b-4 border-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Logo - Left Side */}
            <div className="flex items-center h-full">
              <Link href="/" className="flex items-center h-full">
                <Image 
                  src="/images/syllendar-logo.png?v=2" 
                  alt="Syllendar Logo" 
                  width={320} 
                  height={80}
                  className="h-16 w-auto hover:scale-105 transition-transform duration-200 mix-blend-multiply"
                  priority
                />
              </Link>
            </div>

            {/* Desktop Navigation - Right Side */}
            <div className="hidden md:flex items-center h-full space-x-4">
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  size="sm"
                  asChild
                  className="font-bold hover:bg-yellow-200 h-10"
                >
                  <Link href={item.href} className="flex items-center space-x-2">
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                </Button>
              ))}
              
              <Button variant="default" size="sm" className="h-10">
                SIGN IN
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center h-full">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="h-10 w-10"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t-4 border-black">
            <div className="px-4 py-3 space-y-3">
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-full justify-start font-bold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href={item.href} className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                </Button>
              ))}
              <Button variant="default" size="sm" className="w-full">
                SIGN IN
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-4 border-black mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="font-bold text-black">
              Built with ❤️ for students by students
            </p>
            <p className="text-sm text-gray-600 mt-2">
              © 2024 Syllendar. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 