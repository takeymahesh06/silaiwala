import { Hero } from '@/components/Hero'
import { Services } from '@/components/Services'
import { Features } from '@/components/Features'
import { Process } from '@/components/Process'
import { Testimonials } from '@/components/Testimonials'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Services />
      <Features />
      <Process />
      <Testimonials />
    </div>
  )
}