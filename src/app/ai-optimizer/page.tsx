"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BrainCircuit, Sparkles, CheckCircle, ArrowRight, Loader2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { aiOptimizedAppointmentScheduling, type OptimalAppointmentSchedulingOutput } from '@/ai/flows/ai-optimized-appointment-scheduling'

export default function SmartOptimizerPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OptimalAppointmentSchedulingOutput | null>(null)
  
  const handleOptimize = async () => {
    setLoading(true)
    try {
      const data = await aiOptimizedAppointmentScheduling({
        doctorScheduleDescription: "Dr. Ricardo is booked from 9 AM to 12 PM with 3 cleanings. Lunch is from 1 PM to 2 PM. Afternoon has a gap between 2:30 and 4:00 PM.",
        treatmentType: "Emergency Root Canal",
        requiredDurationMinutes: 45,
        clinicOperatingHours: "9 AM to 6 PM",
        patientPreferences: "Prefers late afternoon slots"
      })
      setResult(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 border border-primary/20">
          <BrainCircuit size={32} />
        </div>
        <h1 className="text-3xl font-headline font-bold text-foreground">Smart Slot Optimizer</h1>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Utilize clinical logic and GenAI to fill gaps in your agenda and maximize daily productivity.
        </p>
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        <div className="bg-primary p-1 text-center text-[10px] font-bold tracking-widest text-white uppercase">
          AI Power Integrated
        </div>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Doctor Availability & Schedule</label>
              <Textarea 
                placeholder="Describe current schedule gaps or constraints..." 
                className="min-h-[120px] bg-muted/30 border-none resize-none"
                defaultValue="Dr. Ricardo is booked from 9 AM to 12 PM with 3 cleanings. Lunch is from 1 PM to 2 PM. Afternoon has a gap between 2:30 and 4:00 PM."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Treatment Needed</label>
                <div className="p-3 bg-muted/30 rounded-lg text-sm">Emergency Root Canal</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Duration</label>
                <div className="p-3 bg-muted/30 rounded-lg text-sm">45 Minutes</div>
              </div>
            </div>

            <Button 
              onClick={handleOptimize} 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 h-12 text-white font-bold gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              Analyze & Suggest Slots
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="text-secondary" size={20} />
            Optimized Suggestions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.suggestedSlots.map((slot, i) => (
              <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                      <Calendar size={20} />
                    </div>
                    <Badge variant="outline" className="text-[10px] border-green-200 text-green-700">Recommended</Badge>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{slot.startTime} - {slot.endTime}</p>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{slot.reason}</p>
                  <Button variant="ghost" className="w-full mt-4 group-hover:bg-primary group-hover:text-white transition-colors h-8 text-xs">
                    Select Slot
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-secondary/10 border-none shadow-sm">
            <CardContent className="p-6 flex items-start gap-4">
              <CheckCircle className="text-secondary shrink-0 mt-1" size={20} />
              <div>
                <p className="font-bold text-secondary text-sm uppercase tracking-wider">Optimization Notes</p>
                <p className="text-sm text-foreground/80 mt-1 leading-relaxed">
                  {result.optimizationNotes}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}