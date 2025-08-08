'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import NeoBrutalistLayout from '@/components/NeoBrutalistLayout'
import { 
  Calendar, 
  Zap, 
  CheckCircle, 
  X, 
  ArrowRight, 
  Sparkles,
  Rocket,
  Clock,
  Bell,
  Mail,
  AlertCircle
} from 'lucide-react'

interface Event {
  id: number
  title: string
  description: string
  event_date: string
  event_type: string
}

export default function CalendarPage() {
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([])
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSelectedEvents = async () => {
      try {
        const eventIds = JSON.parse(localStorage.getItem('selectedEvents') || '[]')
        
        const response = await fetch('http://localhost:8000/courses/1/events')
        if (response.ok) {
          const allEvents = await response.json()
          const selected = allEvents.filter((event: Event) => eventIds.includes(event.id))
          setSelectedEvents(selected)
        }
      } catch (error) {
        console.error('Failed to load events:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSelectedEvents()
  }, [])

  const syncToCalendar = async () => {
    setSyncing(true)
    
    try {
      const eventIds = selectedEvents.map(event => event.id)
      
      const response = await fetch('http://localhost:8000/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_ids: eventIds
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setSyncResult(result)
      } else {
        setSyncResult({ error: 'Failed to sync events. Please try again.' })
      }
    } catch (error) {
      setSyncResult({ error: 'Network error. Please check your connection.' })
    } finally {
      setSyncing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'exam': return 'bg-red-400 text-black'
      case 'assignment': return 'bg-blue-400 text-black'
      case 'project': return 'bg-purple-400 text-black'
      case 'deadline': return 'bg-orange-400 text-black'
      default: return 'bg-gray-400 text-black'
    }
  }

  if (loading) {
    return (
      <NeoBrutalistLayout>
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-6">📅</div>
            <h2 className="text-3xl font-heading font-bold text-black mb-4">
              LOADING YOUR EVENTS...
            </h2>
            <div className="animate-spin w-12 h-12 border-4 border-black border-t-transparent mx-auto"></div>
          </div>
        </div>
      </NeoBrutalistLayout>
    )
  }

  if (syncResult) {
    return (
      <NeoBrutalistLayout>
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className={`border-4 border-black p-8 text-center transform -rotate-1 ${
              syncResult.error ? 'bg-red-400' : 'bg-green-400'
            }`}>
              <CardContent className="p-0">
                {syncResult.error ? (
                  <>
                    <div className="text-6xl mb-6">💥</div>
                    <h1 className="text-4xl font-heading font-bold text-black mb-6">
                      OOPS! SYNC FAILED
                    </h1>
                    <p className="text-xl font-bold text-gray-700 mb-8">
                      {syncResult.error}
                    </p>
                    <p className="text-lg font-bold text-gray-700 mb-8">
                      Don't worry! Your events are safe. Let's try again! 💪
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        size="lg"
                        variant="default"
                        onClick={() => setSyncResult(null)}
                        className="font-bold"
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        TRY AGAIN
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => window.location.href = '/grades'}
                        className="font-bold"
                      >
                        SKIP TO GRADES
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-6">🎉</div>
                    <h1 className="text-4xl font-heading font-bold text-black mb-6">
                      SYNC COMPLETE!
                    </h1>
                    <div className="bg-white border-4 border-black p-6 mb-8 transform rotate-1">
                      <div className="text-3xl font-bold text-black mb-2">
                        {syncResult.successfully_synced} / {syncResult.total_requested}
                      </div>
                      <p className="font-bold text-gray-700">
                        Events synced to your Google Calendar! 🚀
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        size="xl"
                        variant="student"
                        onClick={() => window.location.href = '/grades'}
                        className="font-bold text-xl"
                      >
                        <Rocket className="w-6 h-6 mr-2" />
                        CONTINUE TO GRADES
                        <Sparkles className="w-6 h-6 ml-2" />
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => window.location.href = '/dashboard'}
                        className="font-bold"
                      >
                        GO TO DASHBOARD
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </NeoBrutalistLayout>
    )
  }

  return (
    <NeoBrutalistLayout>
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-400 border-4 border-black px-4 py-2 mb-6 transform rotate-1">
              <Calendar className="w-5 h-5" />
              <span className="font-bold text-black">STEP 3: SYNC TO CALENDAR</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-heading font-bold text-black mb-4">
              TIME TO SYNC!
            </h1>
            <p className="text-xl font-bold text-gray-700 max-w-2xl mx-auto">
              Ready to blast these events into your Google Calendar? 
              Let's make sure you never miss another deadline! 🎯
            </p>
          </div>

          <Card className="bg-white border-4 border-black p-8">
            <CardContent className="p-0">
              {selectedEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">😅</div>
                  <h3 className="text-2xl font-bold text-black mb-4">NO EVENTS SELECTED</h3>
                  <p className="text-lg font-bold text-gray-700 mb-6">
                    Looks like you didn't select any events to sync. 
                    Go back and choose some events first!
                  </p>
                  <Button
                    size="lg"
                    variant="default"
                    onClick={() => window.location.href = '/review'}
                    className="font-bold"
                  >
                    <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                    BACK TO REVIEW
                  </Button>
                </div>
              ) : (
                <>
                  {/* Events to Sync */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-heading font-bold text-black mb-6 text-center">
                      EVENTS TO SYNC ({selectedEvents.length})
                    </h2>

                    <div className="space-y-4">
                      {selectedEvents.map((event, index) => (
                        <Card 
                          key={event.id} 
                          className={`border-4 border-gray-400 transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-start space-x-3">
                                <div className="text-2xl">{getEventEmoji(event.event_type)}</div>
                                <div>
                                  <h3 className="font-bold text-black text-lg">
                                    {event.title}
                                  </h3>
                                  <p className="text-gray-700 font-bold text-sm mb-2">
                                    {event.description}
                                  </p>
                                  <div className="flex items-center space-x-2 text-sm font-bold text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatDate(event.event_date)}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge className={`${getEventTypeColor(event.event_type)} border-2 border-black font-bold`}>
                                {event.event_type.toUpperCase()}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* What Happens Next */}
                  <Card className="bg-yellow-100 border-4 border-black mb-8 transform -rotate-1">
                    <CardHeader>
                      <CardTitle className="text-xl text-black flex items-center">
                        <Sparkles className="w-6 h-6 mr-2" />
                        WHAT HAPPENS NEXT?
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-400 border-2 border-black p-2 rounded">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-black">Added to Calendar</div>
                            <div className="text-sm text-gray-700">Events appear in your primary Google Calendar</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-400 border-2 border-black p-2 rounded">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-black">Email Reminders</div>
                            <div className="text-sm text-gray-700">Get notified 24 hours before each event</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="bg-purple-400 border-2 border-black p-2 rounded">
                            <Bell className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-black">Pop-up Alerts</div>
                            <div className="text-sm text-gray-700">Desktop notifications 1 hour before</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="bg-pink-400 border-2 border-black p-2 rounded">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-black">Fully Editable</div>
                            <div className="text-sm text-gray-700">Modify or delete events anytime in Google Calendar</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="text-center space-y-4">
                    <Button
                      size="xl"
                      onClick={syncToCalendar}
                      disabled={syncing}
                      className="font-bold text-xl w-full sm:w-auto"
                    >
                      {syncing ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                          SYNCING MAGIC IN PROGRESS...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-6 h-6 mr-2" />
                          SYNC TO GOOGLE CALENDAR!
                          <Zap className="w-6 h-6 ml-2" />
                        </>
                      )}
                    </Button>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => window.location.href = '/review'}
                        className="font-bold"
                        disabled={syncing}
                      >
                        <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                        BACK TO REVIEW
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => window.location.href = '/grades'}
                        className="font-bold"
                        disabled={syncing}
                      >
                        SKIP SYNC & GO TO GRADES
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </NeoBrutalistLayout>
  )
} 