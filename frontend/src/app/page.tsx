import { Hero } from '@/components/Hero'
import { Services } from '@/components/Services'
import { Features } from '@/components/Features'
import { Process } from '@/components/Process'
import { Testimonials } from '@/components/Testimonials'
import { Team } from '@/components/Team'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Services />
      <Features />
      <Process />
      <Team />
      <Testimonials />
    </div>
  )
}