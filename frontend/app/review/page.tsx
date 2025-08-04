'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import NeoBrutalistLayout from '@/components/NeoBrutalistLayout'
import { 
  CheckCircle, 
  Circle, 
  Calendar, 
  Clock, 
  Zap, 
  ArrowRight, 
  Sparkles,
  Target,
  BookOpen,
  AlertTriangle
} from 'lucide-react'

interface Event {
  id: number
  title: string
  description: string
  event_date: string
  event_type: string
  is_synced: boolean
}

export default function ReviewPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvents, setSelectedEvents] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:8000/courses/1/events')
        if (response.ok) {
          const data = await response.json()
          setEvents(data)
          setSelectedEvents(data.map((event: Event) => event.id))
        }
      } catch (error) {
        console.error('Failed to fetch events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const toggleEvent = (eventId: number) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  const selectAll = () => {
    setSelectedEvents(events.map(e => e.id))
  }

  const deselectAll = () => {
    setSelectedEvents([])
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  const proceedToCalendar = () => {
    localStorage.setItem('selectedEvents', JSON.stringify(selectedEvents))
    window.location.href = '/calendar'
  }

  if (loading) {
    return (
      <NeoBrutalistLayout>
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-6">⚡</div>
            <h2 className="text-3xl font-heading font-bold text-black mb-4">
              EXTRACTING YOUR EVENTS...
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
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-green-400 border-4 border-black px-4 py-2 mb-6 transform -rotate-1">
              <CheckCircle className="w-5 h-5" />
              <span className="font-bold text-black">STEP 2: REVIEW & SELECT</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-heading font-bold text-black mb-4">
              CHOOSE YOUR BATTLES!
            </h1>
            <p className="text-xl font-bold text-gray-700 max-w-2xl mx-auto">
              We found your important dates! Select which ones you want to sync to your calendar 
              and never miss a deadline again! 🎯
            </p>
          </div>

          {/* Stats & Controls */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-yellow-400 border-4 border-black text-center transform rotate-1">
              <CardContent className="p-6">
                <div className="text-4xl mb-2">📅</div>
                <div className="text-3xl font-bold text-black">{events.length}</div>
                <div className="font-bold text-black">EVENTS FOUND</div>
              </CardContent>
            </Card>

            <Card className="bg-pink-400 border-4 border-black text-center transform -rotate-1">
              <CardContent className="p-6">
                <div className="text-4xl mb-2">✅</div>
                <div className="text-3xl font-bold text-black">{selectedEvents.length}</div>
                <div className="font-bold text-black">SELECTED</div>
              </CardContent>
            </Card>

            <Card className="bg-blue-400 border-4 border-black text-center transform rotate-1">
              <CardContent className="p-6">
                <div className="text-4xl mb-2">🚀</div>
                <div className="text-3xl font-bold text-black">{events.length - selectedEvents.length}</div>
                <div className="font-bold text-black">SKIPPING</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Button 
              variant="success" 
              onClick={selectAll}
              className="font-bold"
            >
              <Target className="w-5 h-5 mr-2" />
              SELECT ALL
            </Button>
            <Button 
              variant="warning" 
              onClick={deselectAll}
              className="font-bold"
            >
              <Circle className="w-5 h-5 mr-2" />
              DESELECT ALL
            </Button>
          </div>

          {/* Events List */}
          <Card className="bg-white border-4 border-black p-8">
            <CardContent className="p-0">
              {events.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">😅</div>
                  <h3 className="text-2xl font-bold text-black mb-4">NO EVENTS FOUND</h3>
                  <p className="text-lg font-bold text-gray-700 mb-6">
                    Looks like your syllabus was pretty light on dates! 
                    You can manually add events later.
                  </p>
                  <Button variant="default" onClick={() => window.location.href = '/upload'}>
                    TRY ANOTHER SYLLABUS
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <Card
                      key={event.id}
                      className={`border-4 cursor-pointer transition-all duration-200 transform ${
                        selectedEvents.includes(event.id)
                          ? 'border-green-600 bg-green-100 rotate-1 scale-105'
                          : 'border-gray-400 hover:border-black hover:-rotate-1'
                      }`}
                      onClick={() => toggleEvent(event.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="text-3xl">{getEventEmoji(event.event_type)}</div>
                              <div>
                                <h3 className="text-xl font-bold text-black">
                                  {event.title}
                                </h3>
                                <Badge className={`${getEventTypeColor(event.event_type)} border-2 border-black font-bold`}>
                                  {event.event_type.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                            
                            <p className="text-gray-700 font-bold mb-3">{event.description}</p>
                            
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-2 font-bold text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(event.event_date)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            {selectedEvents.includes(event.id) ? (
                              <CheckCircle className="w-8 h-8 text-green-600" />
                            ) : (
                              <Circle className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.href = '/upload'}
              className="font-bold"
            >
              <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
              BACK TO UPLOAD
            </Button>
            
            {selectedEvents.length > 0 ? (
              <Button
                size="xl"
                onClick={proceedToCalendar}
                className="font-bold text-xl"
              >
                <Zap className="w-6 h-6 mr-2" />
                SYNC {selectedEvents.length} EVENTS!
                <Sparkles className="w-6 h-6 ml-2" />
              </Button>
            ) : (
              <Button
                size="xl"
                disabled
                className="font-bold text-xl opacity-50 cursor-not-allowed"
              >
                <AlertTriangle className="w-6 h-6 mr-2" />
                SELECT EVENTS TO CONTINUE
              </Button>
            )}
          </div>

          {/* Help Text */}
          {events.length > 0 && (
            <div className="mt-8 text-center">
              <Card className="bg-blue-100 border-4 border-black inline-block p-4 transform rotate-1">
                <CardContent className="p-0">
                  <p className="font-bold text-black text-sm">
                    💡 <strong>PRO TIP:</strong> You can always add or remove events later in your calendar!
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </NeoBrutalistLayout>
  )
} 