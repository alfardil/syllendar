'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import NeoBrutalistLayout from '@/components/NeoBrutalistLayout'
import { LogIn, GraduationCap, Zap, Target, Trophy } from 'lucide-react'

export default function SignInPage() {
  const features = [
    { emoji: '📤', title: 'Smart Upload', description: 'AI extracts everything from your syllabus' },
    { emoji: '📅', title: 'Auto Sync', description: 'Never miss a deadline again' },
    { emoji: '📊', title: 'Grade Tracking', description: 'See exactly what you need to ace' },
    { emoji: '📚', title: 'Study Resources', description: 'Personalized materials for every topic' }
  ]

  const handleGoogleSignIn = () => {
    alert('Google OAuth will be configured with NextAuth - this is a demo!')
  }

  return (
    <NeoBrutalistLayout>
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-green-400 border-4 border-black px-4 py-2 mb-6 transform rotate-2">
              <LogIn className="w-5 h-5" />
              <span className="font-bold text-black">READY TO JOIN THE LEGENDS?</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-heading font-bold text-black mb-4">
              TIME TO LEVEL UP!
            </h1>
            <p className="text-xl font-bold text-gray-700 max-w-2xl mx-auto">
              Join thousands of students who are already CRUSHING their academics with Syllendar! 🚀
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Sign In Card */}
            <Card className="bg-white border-4 border-black p-8 transform -rotate-2">
              <CardContent className="p-0 text-center">
                <div className="text-6xl mb-6">🎓</div>
                <h2 className="text-3xl font-heading font-bold text-black mb-4">
                  WELCOME TO THE CLUB!
                </h2>
                <p className="text-lg font-bold text-gray-700 mb-8">
                  Sign in with Google to unlock your academic superpowers and start dominating this semester!
                </p>
                
                <Button 
                  size="xl"
                  onClick={handleGoogleSignIn}
                  className="w-full font-bold text-xl mb-6"
                >
                  <div className="text-2xl mr-3">🚀</div>
                  SIGN IN WITH GOOGLE
                  <Zap className="w-6 h-6 ml-3" />
                </Button>
                
                <div className="text-sm font-bold text-gray-600">
                  🔒 Secure • 📱 Free • ⚡ Instant Setup
                </div>
              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-heading font-bold text-black mb-4">
                  WHAT YOU'LL GET:
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <Card 
                    key={feature.title}
                    className={`border-4 border-black p-4 transform ${
                      index % 2 === 0 ? 'rotate-1 bg-pink-400' : '-rotate-1 bg-blue-400'
                    } hover:rotate-0 transition-transform duration-200`}
                  >
                    <CardContent className="p-0 text-center">
                      <div className="text-3xl mb-2">{feature.emoji}</div>
                      <h4 className="font-bold text-black text-sm mb-1">{feature.title}</h4>
                      <p className="text-xs text-black">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Success Stories */}
              <Card className="bg-yellow-400 border-4 border-black p-6 transform rotate-1">
                <CardContent className="p-0">
                  <h4 className="font-bold text-black text-center mb-4 flex items-center justify-center">
                    <Trophy className="w-5 h-5 mr-2" />
                    STUDENT SUCCESS STORIES
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="bg-white border-2 border-black p-3 transform -rotate-1">
                      <p className="font-bold text-black">
                        "Went from C+ to A- in one semester! Syllendar is a GAME CHANGER!" - Sarah, NYU
                      </p>
                    </div>
                    <div className="bg-white border-2 border-black p-3 transform rotate-1">
                      <p className="font-bold text-black">
                        "Never missed another deadline. My GPA thanks you!" - Mike, UCLA
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <Card className="bg-main border-4 border-black p-8 transform -rotate-1 inline-block">
              <CardContent className="p-0">
                <h3 className="text-2xl font-heading font-bold text-white mb-4">
                  READY TO BECOME AN ACADEMIC LEGEND?
                </h3>
                <div className="flex items-center justify-center space-x-4 text-white font-bold">
                  <Target className="w-6 h-6" />
                  <span>FREE TO START</span>
                  <span>•</span>
                  <span>NO CREDIT CARD</span>
                  <span>•</span>
                  <span>INSTANT ACCESS</span>
                  <Zap className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </NeoBrutalistLayout>
  )
} 