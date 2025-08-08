'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import NeoBrutalistLayout from '@/components/NeoBrutalistLayout'
import { 
  Search, 
  Filter, 
  ExternalLink, 
  BookOpen, 
  Video, 
  Users, 
  Globe,
  GraduationCap,
  Lightbulb,
  Zap,
  Target,
  Brain,
  Clock
} from 'lucide-react'

interface StudyResource {
  title: string
  url: string
  type: string
  description: string
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<StudyResource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      const response = await fetch('http://localhost:8000/courses/1/resources')
      if (response.ok) {
        const data = await response.json()
        setResources(data)
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'youtube': return Video
      case 'quizlet': return BookOpen
      case 'reddit': return Users
      case 'website': return Globe
      case 'course': return GraduationCap
      case 'khan academy': return Brain
      default: return BookOpen
    }
  }

  const getTypeEmoji = (type: string) => {
    switch (type.toLowerCase()) {
      case 'youtube': return '🎥'
      case 'quizlet': return '📚'
      case 'reddit': return '💬'
      case 'website': return '🌐'
      case 'course': return '🎓'
      case 'khan academy': return '🧠'
      default: return '📄'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'youtube': return 'bg-red-400 text-black'
      case 'quizlet': return 'bg-blue-400 text-black'
      case 'reddit': return 'bg-orange-400 text-black'
      case 'website': return 'bg-green-400 text-black'
      case 'course': return 'bg-purple-400 text-black'
      case 'khan academy': return 'bg-yellow-400 text-black'
      default: return 'bg-gray-400 text-black'
    }
  }

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || resource.type.toLowerCase() === selectedType.toLowerCase()
    return matchesSearch && matchesType
  })

  const resourceTypes = Array.from(new Set(resources.map(r => r.type)))

  const studyTips = [
    {
      icon: Target,
      title: 'ACTIVE RECALL',
      description: 'Test yourself instead of just re-reading notes',
      color: 'bg-red-400'
    },
    {
      icon: Clock,
      title: 'SPACED REPETITION', 
      description: 'Review material at increasing intervals',
      color: 'bg-blue-400'
    },
    {
      icon: Brain,
      title: 'MIND MAPPING',
      description: 'Visualize connections between concepts',
      color: 'bg-green-400'
    },
    {
      icon: Users,
      title: 'STUDY GROUPS',
      description: 'Learn collaboratively with classmates',
      color: 'bg-purple-400'
    }
  ]

  if (loading) {
    return (
      <NeoBrutalistLayout>
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-6">🎯</div>
            <h2 className="text-3xl font-heading font-bold text-black mb-4">
              CURATING AWESOME RESOURCES...
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
            <div className="inline-flex items-center space-x-2 bg-pink-400 border-4 border-black px-4 py-2 mb-6 transform rotate-1">
              <Lightbulb className="w-5 h-5" />
              <span className="font-bold text-black">AI-POWERED STUDY RESOURCES</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-heading font-bold text-black mb-4">
              STUDY LIKE A PRO!
            </h1>
            <p className="text-xl font-bold text-gray-700 max-w-2xl mx-auto">
              AI-curated study materials from YouTube, Quizlet, Reddit, and more! 
              Everything you need to absolutely CRUSH your exams! 🚀
            </p>
          </div>

          {/* Search & Filter */}
          <Card className="bg-white border-4 border-black p-6 mb-8 transform -rotate-1">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="SEARCH FOR AWESOME RESOURCES..."
                    className="pl-10 font-bold"
                  />
                </div>
                <div className="sm:w-48 relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full border-4 border-border bg-background pl-10 pr-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">ALL TYPES</option>
                    {resourceTypes.map(type => (
                      <option key={type} value={type}>{type.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources Grid */}
          {filteredResources.length === 0 ? (
            <Card className="bg-yellow-100 border-4 border-black p-12 text-center transform rotate-1">
              <CardContent className="p-0">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-black mb-4">
                  {searchQuery || selectedType !== 'all' ? 'NO RESOURCES FOUND!' : 'NO RESOURCES YET!'}
                </h3>
                <p className="text-lg font-bold text-gray-700">
                  {searchQuery || selectedType !== 'all' 
                    ? 'Try adjusting your search or filter settings!' 
                    : 'Upload a syllabus first to generate personalized study resources!'}
                </p>
                {!searchQuery && selectedType === 'all' && (
                  <Button 
                    size="lg" 
                    className="mt-6 font-bold"
                    onClick={() => window.location.href = '/upload'}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    UPLOAD SYLLABUS
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredResources.map((resource, index) => {
                const IconComponent = getTypeIcon(resource.type)
                return (
                  <Card 
                    key={index} 
                    className={`${getTypeColor(resource.type)} border-4 border-black transform ${
                      index % 3 === 0 ? 'rotate-1' : index % 3 === 1 ? '-rotate-1' : 'rotate-2'
                    } hover:rotate-0 transition-all duration-300 hover:scale-105`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-4xl">{getTypeEmoji(resource.type)}</div>
                        <Badge className="bg-white text-black border-2 border-black font-bold">
                          {resource.type.toUpperCase()}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg text-black line-clamp-2">
                        {resource.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-black font-bold text-sm mb-4 line-clamp-3">
                        {resource.description}
                      </p>
                      
                      <div className="mt-auto">
                        {resource.url ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full font-bold bg-white hover:bg-gray-100"
                            asChild
                          >
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              OPEN RESOURCE
                            </a>
                          </Button>
                        ) : (
                          <div className="text-center text-gray-500 text-sm py-2 font-bold">
                            RESOURCE UNAVAILABLE
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Study Tips Section */}
          <Card className="bg-white border-4 border-black p-8 transform rotate-1">
            <CardHeader>
              <CardTitle className="text-3xl text-black text-center flex items-center justify-center">
                <Brain className="w-8 h-8 mr-3" />
                STUDY LIKE A LEGEND! 🧠
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                    <Target className="w-6 h-6 mr-2" />
                    PROVEN STRATEGIES
                  </h3>
                  <div className="grid gap-4">
                    {studyTips.map((tip, index) => (
                      <Card key={index} className={`${tip.color} border-2 border-black p-4 transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
                        <CardContent className="p-0">
                          <div className="flex items-center space-x-3">
                            <tip.icon className="w-6 h-6 text-black" />
                            <div>
                              <div className="font-bold text-black text-sm">{tip.title}</div>
                              <div className="text-xs text-black">{tip.description}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                    <Zap className="w-6 h-6 mr-2" />
                    RESOURCE POWER-UPS
                  </h3>
                  <div className="space-y-3 text-black font-bold">
                    <div className="flex items-start space-x-3">
                      <div className="text-xl">🎥</div>
                      <div>
                        <div className="font-bold">YouTube Videos</div>
                        <div className="text-sm text-gray-700">Visual explanations and tutorials</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="text-xl">📚</div>
                      <div>
                        <div className="font-bold">Quizlet Flashcards</div>
                        <div className="text-sm text-gray-700">Spaced repetition and active recall</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="text-xl">💬</div>
                      <div>
                        <div className="font-bold">Reddit Communities</div>
                        <div className="text-sm text-gray-700">Peer discussions and Q&A</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="text-xl">🎓</div>
                      <div>
                        <div className="font-bold">Online Courses</div>
                        <div className="text-sm text-gray-700">Structured learning paths</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="text-xl">🧠</div>
                      <div>
                        <div className="font-bold">Khan Academy</div>
                        <div className="text-sm text-gray-700">Practice exercises and explanations</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </NeoBrutalistLayout>
  )
} 