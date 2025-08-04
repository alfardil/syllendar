'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import NeoBrutalistLayout from '@/components/NeoBrutalistLayout'
import { 
  Plus, 
  TrendingUp, 
  Target, 
  Award, 
  BarChart3, 
  Calendar,
  Trophy,
  Zap,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'

interface Grade {
  id: number
  assignment_name: string
  score: number
  max_score: number
  weight: number
  category: string
  created_at: string
}

interface GradeAnalysis {
  current_grade: number
  projected_grade: number
  needed_scores: Record<string, number>
}

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [analysis, setAnalysis] = useState<GradeAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newGrade, setNewGrade] = useState({
    assignment_name: '',
    score: '',
    max_score: '',
    weight: '',
    category: '',
    course_id: 1
  })

  useEffect(() => {
    fetchGrades()
    fetchAnalysis()
  }, [])

  const fetchGrades = async () => {
    try {
      const response = await fetch('http://localhost:8000/courses/1/grades')
      if (response.ok) {
        const data = await response.json()
        setGrades(data)
      }
    } catch (error) {
      console.error('Failed to fetch grades:', error)
    }
  }

  const fetchAnalysis = async () => {
    try {
      const response = await fetch('http://localhost:8000/courses/1/analysis')
      if (response.ok) {
        const data = await response.json()
        setAnalysis(data)
      }
    } catch (error) {
      console.error('Failed to fetch analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const addGrade = async () => {
    try {
      const gradeData = {
        ...newGrade,
        score: parseFloat(newGrade.score),
        max_score: parseFloat(newGrade.max_score),
        weight: parseFloat(newGrade.weight)
      }

      const response = await fetch('http://localhost:8000/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gradeData),
      })

      if (response.ok) {
        setNewGrade({
          assignment_name: '',
          score: '',
          max_score: '',
          weight: '',
          category: '',
          course_id: 1
        })
        setShowAddForm(false)
        fetchGrades()
        fetchAnalysis()
      }
    } catch (error) {
      console.error('Failed to add grade:', error)
    }
  }

  const calculatePercentage = (score: number, maxScore: number) => {
    return ((score / maxScore) * 100).toFixed(1)
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    if (percentage >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getGradeEmoji = (percentage: number) => {
    if (percentage >= 97) return '🏆'
    if (percentage >= 93) return '🎯'
    if (percentage >= 90) return '⭐'
    if (percentage >= 87) return '👍'
    if (percentage >= 83) return '✅'
    if (percentage >= 80) return '👌'
    if (percentage >= 70) return '📈'
    if (percentage >= 60) return '⚠️'
    return '🚨'
  }

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 97) return 'A+'
    if (percentage >= 93) return 'A'
    if (percentage >= 90) return 'A-'
    if (percentage >= 87) return 'B+'
    if (percentage >= 83) return 'B'
    if (percentage >= 80) return 'B-'
    if (percentage >= 77) return 'C+'
    if (percentage >= 73) return 'C'
    if (percentage >= 70) return 'C-'
    if (percentage >= 67) return 'D+'
    if (percentage >= 65) return 'D'
    return 'F'
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'exam': return 'bg-red-400 text-black'
      case 'assignment': return 'bg-blue-400 text-black'
      case 'project': return 'bg-purple-400 text-black'
      case 'quiz': return 'bg-green-400 text-black'
      case 'participation': return 'bg-yellow-400 text-black'
      default: return 'bg-gray-400 text-black'
    }
  }

  if (loading) {
    return (
      <NeoBrutalistLayout>
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-6">📊</div>
            <h2 className="text-3xl font-heading font-bold text-black mb-4">
              CALCULATING YOUR AWESOMENESS...
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <div className="inline-flex items-center space-x-2 bg-purple-400 border-4 border-black px-4 py-2 mb-6 transform -rotate-1">
                <BarChart3 className="w-5 h-5" />
                <span className="font-bold text-black">GRADE TRACKER</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-heading font-bold text-black mb-4">
                YOUR GRADE GAME!
              </h1>
              <p className="text-xl font-bold text-gray-700 max-w-2xl">
                Track your progress, see what you need to ACE that final, and dominate your semester! 🎯
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setShowAddForm(true)}
              className="font-bold mt-6 md:mt-0"
            >
              <Plus className="w-5 h-5 mr-2" />
              ADD GRADE
            </Button>
          </div>

          {/* Grade Analytics */}
          {analysis && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-green-400 border-4 border-black text-center transform rotate-1">
                <CardContent className="p-6">
                  <div className="text-4xl mb-2">{getGradeEmoji(analysis.current_grade)}</div>
                  <div className="text-3xl font-bold text-black mb-1">
                    {analysis.current_grade.toFixed(1)}%
                  </div>
                  <div className="text-xl font-bold text-black mb-2">
                    {getGradeLetter(analysis.current_grade)}
                  </div>
                  <div className="font-bold text-black">CURRENT GRADE</div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-400 border-4 border-black text-center transform -rotate-1">
                <CardContent className="p-6">
                  <div className="text-4xl mb-2">🔮</div>
                  <div className="text-3xl font-bold text-black mb-1">
                    {analysis.projected_grade.toFixed(1)}%
                  </div>
                  <div className="text-xl font-bold text-black mb-2">
                    {getGradeLetter(analysis.projected_grade)}
                  </div>
                  <div className="font-bold text-black">PROJECTED GRADE</div>
                </CardContent>
              </Card>
              
              <Card className="bg-yellow-400 border-4 border-black transform rotate-1">
                <CardHeader>
                  <CardTitle className="text-lg text-black text-center flex items-center justify-center">
                    <Target className="w-5 h-5 mr-2" />
                    NEEDED SCORES
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(analysis.needed_scores).map(([category, score]) => (
                      <div key={category} className="flex justify-between text-sm">
                        <span className="capitalize font-bold text-black">{category}:</span>
                        <span className="font-bold text-black">{score.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Grades List */}
          <Card className="bg-white border-4 border-black p-8">
            <CardHeader>
              <CardTitle className="text-2xl text-black flex items-center justify-between">
                <div className="flex items-center">
                  <Trophy className="w-6 h-6 mr-2" />
                  ALL GRADES ({grades.length})
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {grades.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">📈</div>
                  <h3 className="text-2xl font-bold text-black mb-4">NO GRADES YET!</h3>
                  <p className="text-lg font-bold text-gray-700 mb-6">
                    Start adding your assignment grades to track your epic progress! 🚀
                  </p>
                  <Button
                    size="lg"
                    onClick={() => setShowAddForm(true)}
                    className="font-bold"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    ADD YOUR FIRST GRADE
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {grades.map((grade, index) => {
                    const percentage = parseFloat(calculatePercentage(grade.score, grade.max_score))
                    return (
                      <Card 
                        key={grade.id} 
                        className={`border-4 border-gray-400 transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0 transition-transform duration-200`}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="text-2xl">{getGradeEmoji(percentage)}</div>
                                <div>
                                  <h3 className="font-bold text-black text-lg">
                                    {grade.assignment_name}
                                  </h3>
                                  <Badge className={`${getCategoryColor(grade.category)} border-2 border-black font-bold text-xs`}>
                                    {grade.category.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <div className="font-bold text-gray-600">SCORE</div>
                                  <div className="font-bold text-black">{grade.score} / {grade.max_score}</div>
                                </div>
                                <div>
                                  <div className="font-bold text-gray-600">PERCENTAGE</div>
                                  <div className={`font-bold ${getGradeColor(percentage)}`}>
                                    {percentage}%
                                  </div>
                                </div>
                                <div>
                                  <div className="font-bold text-gray-600">WEIGHT</div>
                                  <div className="font-bold text-black">{grade.weight}%</div>
                                </div>
                                <div>
                                  <div className="font-bold text-gray-600">DATE</div>
                                  <div className="font-bold text-black">
                                    {new Date(grade.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="ml-4 text-center">
                              <div className={`text-2xl font-bold ${getGradeColor(percentage)}`}>
                                {getGradeLetter(percentage)}
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
      </div>

      {/* Add Grade Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white border-4 border-black max-w-md w-full transform -rotate-1">
            <CardHeader>
              <CardTitle className="text-2xl text-black flex items-center justify-between">
                <div className="flex items-center">
                  <Plus className="w-6 h-6 mr-2" />
                  ADD NEW GRADE
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddForm(false)}
                  className="text-black hover:bg-red-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    ASSIGNMENT NAME *
                  </label>
                  <Input
                    type="text"
                    value={newGrade.assignment_name}
                    onChange={(e) => setNewGrade({...newGrade, assignment_name: e.target.value})}
                    placeholder="e.g., Midterm Exam"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      SCORE *
                    </label>
                    <Input
                      type="number"
                      value={newGrade.score}
                      onChange={(e) => setNewGrade({...newGrade, score: e.target.value})}
                      placeholder="85"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      MAX SCORE *
                    </label>
                    <Input
                      type="number"
                      value={newGrade.max_score}
                      onChange={(e) => setNewGrade({...newGrade, max_score: e.target.value})}
                      placeholder="100"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      WEIGHT (%) *
                    </label>
                    <Input
                      type="number"
                      value={newGrade.weight}
                      onChange={(e) => setNewGrade({...newGrade, weight: e.target.value})}
                      placeholder="20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      CATEGORY *
                    </label>
                    <select
                      value={newGrade.category}
                      onChange={(e) => setNewGrade({...newGrade, category: e.target.value})}
                      className="w-full border-4 border-border bg-background px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">SELECT CATEGORY</option>
                      <option value="exam">EXAM</option>
                      <option value="assignment">ASSIGNMENT</option>
                      <option value="project">PROJECT</option>
                      <option value="quiz">QUIZ</option>
                      <option value="participation">PARTICIPATION</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 font-bold"
                >
                  CANCEL
                </Button>
                <Button
                  onClick={addGrade}
                  disabled={!newGrade.assignment_name || !newGrade.score || !newGrade.max_score || !newGrade.weight || !newGrade.category}
                  className="flex-1 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  ADD GRADE
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </NeoBrutalistLayout>
  )
} 