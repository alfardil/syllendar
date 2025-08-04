'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import NeoBrutalistLayout from '@/components/NeoBrutalistLayout'
import { 
  Home,
  Upload,
  Calendar,
  BarChart3,
  BookOpen,
  TrendingUp,
  Clock,
  Trophy,
  Zap,
  Target,
  Rocket,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface Course {
  id: number
  name: string
  code: string
  instructor: string
  created_at: string
}

interface Event {
  id: number
  title: string
  event_date: string
  event_type: string
  is_synced: boolean
}

interface Grade {
  id: number
  assignment_name: string
  score: number
  max_score: number
  category: string
  created_at: string
}

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [recentGrades, setRecentGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [coursesRes, eventsRes, gradesRes] = await Promise.all([
        fetch('http://localhost:8000/users/1/courses'),
        fetch('http://localhost:8000/courses/1/events'),
        fetch('http://localhost:8000/courses/1/grades')
      ])

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        setCourses(coursesData)
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        const upcoming = eventsData
          .filter((event: Event) => new Date(event.event_date) > new Date())
          .sort((a: Event, b: Event) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
          .slice(0, 5)
        setUpcomingEvents(upcoming)
      }

      if (gradesRes.ok) {
        const gradesData = await gradesRes.json()
        const recent = gradesData
          .sort((a: Grade, b: Grade) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
        setRecentGrades(recent)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculatePercentage = (score: number, maxScore: number) => {
    return ((score / maxScore) * 100).toFixed(1)
  }

  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'exam': return 'bg-red-400 text-black'
      case 'assignment': return 'bg-blue-400 text-black'
      case 'project': return 'bg-purple-400 text-black'
      case 'deadline': return 'bg-orange-400 text-black'
      default: return 'bg-gray-400 text-black'
    }
  }

  const getEventEmoji = (type: string) => {
    switch (type.toLowerCase()) {
      case 'exam': return '📝'
      case 'assignment': return '📋'
      case 'project': return '🛠️'
      case 'deadline': return '⏰'
      default: return '📅'
    }
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    if (percentage >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getGradeEmoji = (percentage: number) => {
    if (percentage >= 90) return '🏆'
    if (percentage >= 80) return '⭐'
    if (percentage >= 70) return '👍'
    if (percentage >= 60) return '📈'
    return '⚠️'
  }

  const quickActions = [
    { 
      title: 'UPLOAD SYLLABUS', 
      href: '/upload', 
      icon: Upload, 
      color: 'bg-red-400',
      emoji: '📤'
    },
    { 
      title: 'ADD GRADE', 
      href: '/grades', 
      icon: BarChart3, 
      color: 'bg-green-400',
      emoji: '📊' 
    },
    { 
      title: 'STUDY RESOURCES', 
      href: '/resources', 
      icon: BookOpen, 
      color: 'bg-blue-400',
      emoji: '📚'
    },
    { 
      title: 'SYNC CALENDAR', 
      href: '/calendar', 
      icon: Calendar, 
      color: 'bg-purple-400',
      emoji: '📅'
    }
  ]

  if (loading) {
    return (
      <NeoBrutalistLayout>
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-3xl font-heading font-bold text-black mb-4">
              LOADING YOUR COMMAND CENTER...
            </h2>
            <div className="animate-spin w-12 h-12 border-4 border-black border-t-transparent mx-auto"></div>
          </div>
        </div>
      </NeoBrutalistLayout>
    )
  }

  return (
    <NeoBrutalistLayout>
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero Welcome */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-yellow-400 border-4 border-black px-4 py-2 mb-6 transform -rotate-1">
              <Home className="w-5 h-5" />
              <span className="font-bold text-black">COMMAND CENTER</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-heading font-bold text-black mb-4">
              WELCOME BACK,
              <span className="block text-main">ACADEMIC LEGEND!</span>
            </h1>
            <p className="text-xl font-bold text-gray-700 max-w-2xl mx-auto">
              Here's your academic empire overview. Time to DOMINATE this semester! 🎯
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-pink-400 border-4 border-black text-center transform rotate-2">
              <CardContent className="p-6">
                <div className="text-4xl mb-2">📚</div>
                <div className="text-2xl font-bold text-black">{courses.length}</div>
                <div className="text-sm font-bold text-black">COURSES</div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-400 border-4 border-black text-center transform -rotate-1">
              <CardContent className="p-6">
                <div className="text-4xl mb-2">📅</div>
                <div className="text-2xl font-bold text-black">{upcomingEvents.length}</div>
                <div className="text-sm font-bold text-black">UPCOMING</div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-400 border-4 border-black text-center transform rotate-1">
              <CardContent className="p-6">
                <div className="text-4xl mb-2">📊</div>
                <div className="text-2xl font-bold text-black">{recentGrades.length}</div>
                <div className="text-sm font-bold text-black">GRADES</div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-400 border-4 border-black text-center transform -rotate-2">
              <CardContent className="p-6">
                <div className="text-4xl mb-2">✅</div>
                <div className="text-2xl font-bold text-black">
                  {upcomingEvents.filter(e => e.is_synced).length}
                </div>
                <div className="text-sm font-bold text-black">SYNCED</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Upcoming Events */}
            <Card className="bg-white border-4 border-black">
              <CardHeader>
                <CardTitle className="text-2xl text-black flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-6 h-6 mr-2" />
                    UPCOMING EVENTS
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="/calendar" className="text-main font-bold">
                      VIEW ALL →
                    </a>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📅</div>
                    <p className="font-bold text-gray-600">No upcoming events!</p>
                    <p className="text-sm text-gray-600">Your schedule is clear!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event, index) => (
                      <Card key={event.id} className={`border-2 border-gray-400 transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="text-xl">{getEventEmoji(event.event_type)}</div>
                              <div>
                                <h3 className="font-bold text-black text-sm">{event.title}</h3>
                                <p className="text-xs font-bold text-gray-600">{formatDate(event.event_date)}</p>
                              </div>
                            </div>
                            <Badge className={`${getEventTypeColor(event.event_type)} border-2 border-black font-bold text-xs`}>
                              {event.event_type.toUpperCase()}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Grades */}
            <Card className="bg-white border-4 border-black">
              <CardHeader>
                <CardTitle className="text-2xl text-black flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="w-6 h-6 mr-2" />
                    RECENT GRADES
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="/grades" className="text-main font-bold">
                      VIEW ALL →
                    </a>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentGrades.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="font-bold text-gray-600">No grades yet!</p>
                    <p className="text-sm text-gray-600">Start tracking your progress!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentGrades.map((grade, index) => {
                      const percentage = parseFloat(calculatePercentage(grade.score, grade.max_score))
                      return (
                        <Card key={grade.id} className={`border-2 border-gray-400 transform ${index % 2 === 0 ? '-rotate-1' : 'rotate-1'}`}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="text-xl">{getGradeEmoji(percentage)}</div>
                                <div>
                                  <h3 className="font-bold text-black text-sm">{grade.assignment_name}</h3>
                                  <p className="text-xs font-bold text-gray-600 capitalize">{grade.category}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`font-bold ${getGradeColor(percentage)}`}>
                                  {percentage}%
                                </div>
                                <div className="text-xs text-gray-500">
                                  {grade.score}/{grade.max_score}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-white border-4 border-black mb-8 transform rotate-1">
            <CardHeader>
              <CardTitle className="text-2xl text-black text-center flex items-center justify-center">
                <Zap className="w-6 h-6 mr-2" />
                QUICK ACTIONS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={action.title}
                    variant="outline"
                    size="lg"
                    className={`${action.color} border-4 border-black font-bold h-auto p-4 transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0 transition-transform duration-200`}
                    asChild
                  >
                    <a href={action.href} className="flex flex-col items-center space-y-2">
                      <div className="text-2xl">{action.emoji}</div>
                      <span className="text-xs text-center">{action.title}</span>
                    </a>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Courses Overview */}
          <Card className="bg-white border-4 border-black">
            <CardHeader>
              <CardTitle className="text-2xl text-black flex items-center">
                <BookOpen className="w-6 h-6 mr-2" />
                YOUR COURSES
              </CardTitle>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-2xl font-bold text-black mb-4">NO COURSES YET!</h3>
                  <p className="text-lg font-bold text-gray-700 mb-6">
                    Upload your first syllabus to get started with your academic domination!
                  </p>
                  <Button size="lg" className="font-bold" asChild>
                    <a href="/upload">
                      <Rocket className="w-5 h-5 mr-2" />
                      UPLOAD SYLLABUS
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course, index) => (
                    <Card key={course.id} className={`border-4 border-gray-400 transform ${index % 3 === 0 ? 'rotate-1' : index % 3 === 1 ? '-rotate-1' : 'rotate-2'} hover:rotate-0 transition-transform duration-200`}>
                      <CardContent className="p-4">
                        <div className="text-2xl mb-2">🎓</div>
                        <h3 className="font-bold text-black mb-1">{course.name}</h3>
                        <p className="text-sm font-bold text-gray-600 mb-2">{course.code}</p>
                        {course.instructor && (
                          <p className="text-xs text-gray-500">Prof: {course.instructor}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Added {new Date(course.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </NeoBrutalistLayout>
  )
} 