"use client"

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Send, Bot, User, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { patientAIAppointmentConcierge } from '@/ai/flows/patient-ai-appointment-concierge'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Message {
  role: 'ai' | 'user'
  text: string
  action?: string
}

export default function ConciergePage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: '¡Hola! Soy la IA de DentaSync, su asistente clínico personal. ¿En qué puedo ayudarle con sus citas hoy?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    
    const userMsg = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const result = await patientAIAppointmentConcierge({
        patientId: 'PAT-DEMO-01',
        message: userMsg
      })
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: result.response,
        action: result.actionTaken !== 'none' ? result.actionTaken : undefined
      }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Lo siento, pero he encontrado un error al procesar su solicitud. Por favor, inténtelo de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Tu Asistente virtual</h1>
          <p className="text-muted-foreground mt-1">Sistema automatizado de gestión de citas 24/7.</p>
        </div>
        <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20 border-secondary/20 px-3 py-1 gap-2">
          <Sparkles size={14} /> IA Activa
        </Badge>
      </div>

      <Card className="flex-1 flex flex-col border-none shadow-xl overflow-hidden">
        <CardHeader className="bg-primary text-white border-b-0 pb-8 pt-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-inner">
              <Image 
                src="/mi-logo.png" 
                alt="Logo Clínica" 
                width={40} 
                height={40} 
                className="object-contain"
              />
            </div>
            <div>
              <CardTitle className="text-white">Asistente DentaSync</CardTitle>
              <CardDescription className="text-white/60">Agente Automatizado de Soporte al Paciente</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={cn(
              "flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2",
              m.role === 'user' ? "flex-row-reverse" : ""
            )}>
              <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                m.role === 'ai' ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
              )}>
                {m.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="space-y-2 max-w-[80%]">
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                  m.role === 'ai' ? "bg-white border rounded-tl-none" : "bg-secondary text-white rounded-tr-none"
                )}>
                  {m.text}
                </div>
                {m.action && (
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-green-100 w-fit">
                    <CheckCircle2 size={12} />
                    Acción: {m.action}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-3 text-muted-foreground italic text-sm animate-pulse">
              <Loader2 className="animate-spin" size={16} />
              La IA está pensando...
            </div>
          )}
        </CardContent>

        <div className="p-6 bg-muted/30 border-t">
          <div className="flex gap-3">
            <Input 
              placeholder="Escriba su solicitud (ej. 'Quiero reprogramar mi limpieza para el próximo martes')" 
              className="bg-white h-12 shadow-sm border-none focus-visible:ring-1 focus-visible:ring-primary/20"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-primary hover:bg-primary/90 h-12 w-12 rounded-xl shrink-0 text-white"
            >
              <Send size={18} />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-3 font-medium uppercase tracking-tighter">
            Impulsado por el Motor de Programación Inteligente DentaSync
          </p>
        </div>
      </Card>
    </div>
  )
}
