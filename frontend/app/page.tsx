'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import NeoBrutalistLayout from '@/components/NeoBrutalistLayout'
import { 
  Upload, 
  Calendar, 
  BarChart3,
  BookOpen,
  Sparkles,
  GraduationCap,
  ArrowRight,
  Zap,
  Target,
  Rocket
} from 'lucide-react'

const features = [
  {
    icon: Upload,
    title: 'SMART PDF UPLOAD',
    description: 'Drop your syllabus and watch AI extract ALL the important dates and grade breakdowns!',
    color: 'bg-red-400',
    emoji: '📤'
  },
  {
    icon: Calendar,
    title: 'CALENDAR SYNC',
    description: 'Never miss a deadline again! Sync events straight to Google Calendar with one click.',
    color: 'bg-blue-400',
    emoji: '📅'
  },
  {
    icon: BarChart3,
    title: 'GRADE TRACKING',
    description: 'Track your grades and see EXACTLY what you need to ace that final exam!',
    color: 'bg-green-400',
    emoji: '📊'
  },
  {
    icon: BookOpen,
    title: 'STUDY RESOURCES',
    description: 'Get personalized study materials from YouTube, Quizlet, Reddit and more!',
    color: 'bg-purple-400',
    emoji: '📚'
  }
]

const stats = [
  { number: '10K+', label: 'Students Using', emoji: '🎓' },
  { number: '50K+', label: 'Events Synced', emoji: '📅' },
  { number: '95%', label: 'Grade Improvement', emoji: '📈' },
  { number: '100%', label: 'Student Approved', emoji: '⭐' }
]

export default function HomePage() {
  return (
    <NeoBrutalistLayout>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Floating Badge */}
          <div className="inline-flex items-center space-x-2 bg-pink-400 border-4 border-black px-4 py-2 mb-8 transform rotate-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold text-black">NEW: AI-POWERED STUDY PLANNER</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-heading font-bold text-black mb-6 leading-tight">
            YOUR ACADEMIC
            <span className="block text-main">SUPERPOWER!</span>
          </h1>

          <p className="text-xl md:text-2xl font-bold text-gray-700 mb-12 max-w-3xl mx-auto">
            Stop drowning in syllabi! Upload, extract, sync, and DOMINATE your semester 
            with the smartest academic planner ever built! 🚀
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="xl" className="text-lg font-bold" asChild>
              <Link href="/upload" className="flex items-center">
                <Rocket className="w-6 h-6 mr-2" />
                START DOMINATING
                <ArrowRight className="w-6 h-6 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" className="text-lg font-bold" asChild>
              <Link href="/auth/signin">
                SIGN IN
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {stats.map((stat, index) => (
              <Card key={index} className={`text-center p-4 transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
                <CardContent className="p-0">
                  <div className="text-3xl mb-2">{stat.emoji}</div>
                  <div className="text-2xl font-bold text-black">{stat.number}</div>
                  <div className="text-sm font-bold text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-heading font-bold text-black mb-6">
              FEATURES THAT
              <span className="block text-main">ACTUALLY WORK!</span>
            </h2>
            <p className="text-xl font-bold text-gray-700 max-w-2xl mx-auto">
              No fluff, no BS. Just tools that make your academic life 10x easier.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className={`${feature.color} border-4 border-black transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0 transition-transform duration-300`}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-4xl">{feature.emoji}</div>
                    <feature.icon className="w-8 h-8 text-black" />
                  </div>
                  <CardTitle className="text-2xl text-black">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-black font-bold text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-yellow-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-heading font-bold text-black mb-6">
              HOW IT WORKS
            </h2>
            <p className="text-xl font-bold text-gray-700">
              Three steps to academic dominance!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-pink-400 text-center transform rotate-2">
              <CardHeader>
                <div className="text-6xl mb-4">📤</div>
                <CardTitle className="text-2xl text-black">
                  1. UPLOAD
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-black font-bold text-base">
                  Drop your syllabus PDF and watch our AI extract EVERYTHING important!
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-green-400 text-center transform -rotate-1">
              <CardHeader>
                <div className="text-6xl mb-4">⚡</div>
                <CardTitle className="text-2xl text-black">
                  2. REVIEW
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-black font-bold text-base">
                  Check the extracted dates and choose what to sync to your calendar!
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-blue-400 text-center transform rotate-1">
              <CardHeader>
                <div className="text-6xl mb-4">🚀</div>
                <CardTitle className="text-2xl text-black">
                  3. DOMINATE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-black font-bold text-base">
                  Track grades, get study resources, and ACE your semester!
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-main">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white border-4 border-black p-12 transform -rotate-1">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-black mb-6">
              READY TO BECOME AN
              <span className="block text-main">ACADEMIC LEGEND?</span>
            </h2>
            <p className="text-xl font-bold text-gray-700 mb-8">
              Join thousands of students who are already crushing their classes with Syllendar!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="xl" 
                variant="student"
                className="text-lg font-bold"
                asChild
              >
                <Link href="/upload" className="flex items-center">
                  <Target className="w-6 h-6 mr-2" />
                  START YOUR JOURNEY
                  <Zap className="w-6 h-6 ml-2" />
                </Link>
              </Button>
            </div>

            <p className="text-sm font-bold text-gray-600 mt-4">
              Free to start • No credit card required • Instant setup
            </p>
          </div>
        </div>
      </section>
    </NeoBrutalistLayout>
  )
} 