"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type ToothStatus = 'healthy' | 'decay' | 'filled' | 'missing' | 'crown'

interface ToothProps {
  id: number
  status: ToothStatus
  onClick: (id: number) => void
}

const Tooth = ({ id, status, onClick }: ToothProps) => {
  const getStatusColor = (s: ToothStatus) => {
    switch (s) {
      case 'decay': return 'bg-red-500 text-white'
      case 'filled': return 'bg-blue-500 text-white'
      case 'missing': return 'bg-gray-300 text-gray-500'
      case 'crown': return 'bg-yellow-500 text-white'
      default: return 'bg-white border-2 border-primary/20 text-primary/40 hover:border-primary hover:text-primary'
    }
  }

  return (
    <button
      onClick={() => onClick(id)}
      className={cn(
        "w-10 h-14 rounded-md flex flex-col items-center justify-center text-[10px] font-bold transition-all duration-200 shadow-sm",
        getStatusColor(status)
      )}
    >
      <span className="mb-1">{id}</span>
      <div className="w-6 h-6 border rounded-full bg-white/20" />
    </button>
  )
}

export function Odontogram() {
  const [teeth, setTeeth] = useState<Record<number, ToothStatus>>({})

  const toggleStatus = (id: number) => {
    const statuses: ToothStatus[] = ['healthy', 'decay', 'filled', 'missing', 'crown']
    const current = teeth[id] || 'healthy'
    const nextIndex = (statuses.indexOf(current) + 1) % statuses.length
    setTeeth(prev => ({ ...prev, [id]: statuses[nextIndex] }))
  }

  const renderJaw = (start: number, end: number, reverse = false) => {
    const range = Array.from({ length: end - start + 1 }, (_, i) => start + i)
    if (reverse) range.reverse()
    return (
      <div className="flex gap-1 flex-wrap justify-center">
        {range.map(id => (
          <Tooth 
            key={id} 
            id={id} 
            status={teeth[id] || 'healthy'} 
            onClick={toggleStatus} 
          />
        ))}
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Odontograma Interactivo</CardTitle>
            <CardDescription>Haga clic en un diente para cambiar su estado clínico</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">Caries</Badge>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Empaste</Badge>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Corona</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-12 py-8">
        <div className="space-y-4">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mandíbula Superior</p>
          <div className="flex justify-center gap-8">
            {renderJaw(11, 18, true)}
            {renderJaw(21, 28)}
          </div>
        </div>
        
        <div className="space-y-4">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mandíbula Inferior</p>
          <div className="flex justify-center gap-8">
            {renderJaw(41, 48, true)}
            {renderJaw(31, 38)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
