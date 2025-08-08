'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import NeoBrutalistLayout from '@/components/NeoBrutalistLayout'
import { Upload, FileText, Sparkles, Zap, CheckCircle, AlertCircle } from 'lucide-react'

export default function UploadPage() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [courseInfo, setCourseInfo] = useState({
    courseName: '',
    courseCode: '',
    instructor: ''
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const pdfFile = files.find(file => file.type === 'application/pdf')
    
    if (pdfFile) {
      setSelectedFile(pdfFile)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !courseInfo.courseName || !courseInfo.courseCode) {
      return
    }

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('course_name', courseInfo.courseName)
      formData.append('course_code', courseInfo.courseCode)
      formData.append('instructor', courseInfo.instructor)
      formData.append('user_id', '1')

      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setUploadResult(result)
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  if (uploadResult) {
    return (
      <NeoBrutalistLayout>
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-green-400 border-4 border-black p-8 text-center transform -rotate-1">
              <CardContent className="p-0">
                <div className="text-6xl mb-6">🎉</div>
                <h1 className="text-4xl font-heading font-bold text-black mb-6">
                  UPLOAD SUCCESSFUL!
                </h1>
                
                <div className="grid md:grid-cols-2 gap-6 my-8">
                  <Card className="bg-white border-4 border-black transform rotate-1">
                    <CardHeader>
                      <CardTitle className="text-lg text-black flex items-center">
                        <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                        EVENTS EXTRACTED
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-black">
                        {uploadResult.events}
                      </div>
                      <p className="font-bold text-gray-700">
                        Important dates found and ready to sync!
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white border-4 border-black transform -rotate-1">
                    <CardHeader>
                      <CardTitle className="text-lg text-black flex items-center">
                        <Zap className="w-6 h-6 mr-2 text-yellow-600" />
                        GRADE BREAKDOWN
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(uploadResult.grade_breakdown || {}).map(([category, weight]: [string, any]) => (
                          <div key={category} className="flex justify-between font-bold text-black">
                            <span className="capitalize">{category}:</span>
                            <span>{weight}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    variant="default"
                    className="font-bold"
                    onClick={() => window.location.href = '/review'}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    REVIEW EVENTS
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="font-bold"
                    onClick={() => {
                      setUploadResult(null)
                      setSelectedFile(null)
                      setCourseInfo({ courseName: '', courseCode: '', instructor: '' })
                    }}
                  >
                    UPLOAD ANOTHER
                  </Button>
                </div>
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
            <div className="inline-flex items-center space-x-2 bg-yellow-400 border-4 border-black px-4 py-2 mb-6 transform rotate-1">
              <Upload className="w-5 h-5" />
              <span className="font-bold text-black">STEP 1: UPLOAD YOUR SYLLABUS</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-heading font-bold text-black mb-4">
              DROP YOUR SYLLABUS!
            </h1>
            <p className="text-xl font-bold text-gray-700 max-w-2xl mx-auto">
              Upload your course syllabus PDF and watch AI extract ALL the important dates 
              and grade breakdowns automatically! ⚡
            </p>
          </div>

          <Card className="bg-white border-4 border-black p-8">
            <CardContent className="p-0">
              {/* Course Info Form */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-lg font-bold text-black mb-3">
                    COURSE NAME *
                  </label>
                  <Input
                    type="text"
                    value={courseInfo.courseName}
                    onChange={(e) => setCourseInfo({...courseInfo, courseName: e.target.value})}
                    placeholder="e.g., Introduction to Computer Science"
                    className="text-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-lg font-bold text-black mb-3">
                    COURSE CODE *
                  </label>
                  <Input
                    type="text"
                    value={courseInfo.courseCode}
                    onChange={(e) => setCourseInfo({...courseInfo, courseCode: e.target.value})}
                    placeholder="e.g., CS 101"
                    className="text-lg"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-lg font-bold text-black mb-3">
                    INSTRUCTOR (OPTIONAL)
                  </label>
                  <Input
                    type="text"
                    value={courseInfo.instructor}
                    onChange={(e) => setCourseInfo({...courseInfo, instructor: e.target.value})}
                    placeholder="e.g., Dr. Smith"
                    className="text-lg"
                  />
                </div>
              </div>

              {/* File Upload Area */}
              <div
                className={`border-4 border-dashed p-12 text-center transition-all duration-300 transform ${
                  isDragOver 
                    ? 'border-main bg-purple-100 rotate-1' 
                    : selectedFile 
                    ? 'border-green-600 bg-green-100 -rotate-1'
                    : 'border-gray-400 hover:border-main hover:bg-yellow-50 hover:rotate-1'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="text-green-600">
                    <FileText className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2 text-black">FILE SELECTED!</h3>
                    <p className="text-lg font-bold text-gray-700 mb-4">{selectedFile.name}</p>
                    <Button
                      variant="destructive"
                      onClick={() => setSelectedFile(null)}
                      className="font-bold"
                    >
                      REMOVE FILE
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-2xl font-bold mb-2 text-black">
                      {isDragOver ? 'DROP IT LIKE IT\'S HOT!' : 'DRAG & DROP YOUR PDF'}
                    </h3>
                    <p className="text-lg font-bold text-gray-700 mb-6">
                      Or click to browse and select your syllabus file
                    </p>
                    <label htmlFor="file-upload">
                      <Button 
                        variant="default" 
                        size="lg"
                        className="font-bold cursor-pointer"
                        asChild
                      >
                        <span>
                          <FileText className="w-5 h-5 mr-2" />
                          CHOOSE FILE
                        </span>
                      </Button>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="mt-8 text-center">
                <Button
                  size="xl"
                  onClick={handleUpload}
                  disabled={!selectedFile || !courseInfo.courseName || !courseInfo.courseCode || isUploading}
                  className="text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      PROCESSING MAGIC...
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6 mr-2" />
                      EXTRACT THE GOODS!
                    </>
                  )}
                </Button>
                
                {(!selectedFile || !courseInfo.courseName || !courseInfo.courseCode) && (
                  <div className="mt-4 flex items-center justify-center text-yellow-600">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span className="font-bold">Please fill all required fields and select a PDF!</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </NeoBrutalistLayout>
  )
} 