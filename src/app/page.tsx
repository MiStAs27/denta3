import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Stethoscope, BrainCircuit, UserCheck, ShieldCheck, ChevronRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-12">
        <div className="bg-primary p-4 rounded-3xl text-white inline-block shadow-2xl shadow-primary/30 mb-6">
          <Stethoscope size={48} />
        </div>
        <h1 className="text-5xl font-headline font-black text-foreground tracking-tight sm:text-7xl">
          Denta<span className="text-primary">Sync</span>
        </h1>
        <p className="text-muted-foreground mt-4 text-lg max-w-xl mx-auto">
          The all-in-one dental management platform powered by AI. Digital records, smart scheduling, and automated patient care.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full mb-12">
        {[
          { title: 'Interactive Odontogram', desc: 'Real-time tooth procedures tracking', icon: Stethoscope },
          { title: 'Smart Slot Optimizer', desc: 'AI-driven agenda efficiency', icon: BrainCircuit },
          { title: 'AI Concierge', desc: '24/7 patient booking support', icon: UserCheck },
          { title: 'Secure Cloud Records', desc: 'GDPR-ready patient history', icon: ShieldCheck },
        ].map((f, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-muted shadow-sm hover:shadow-md transition-shadow">
            <f.icon className="text-primary mb-4" size={28} />
            <h3 className="font-bold text-foreground mb-1">{f.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <Link href="/dashboard">
        <Button size="lg" className="bg-primary text-white hover:bg-primary/90 h-16 px-10 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 gap-3 group">
          Enter Clinic Portal
          <ChevronRight className="group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>
      
      <p className="mt-8 text-xs font-bold text-muted-foreground uppercase tracking-widest">
        DentaSync SaaS v1.0 • Clinical Navy Edition
      </p>
    </div>
  )
}