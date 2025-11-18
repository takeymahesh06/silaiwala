import { Crown, Award, Heart } from 'lucide-react'

const teamMembers = [
  {
    name: 'Rutuja Arle',
    role: 'Founder of Swaruchii',
    description: 'Women\'s Fashion Apparel Brand',
    image: '/api/placeholder/300/300',
    achievements: [
      'Expert in women\'s fashion design',
      '10+ years in tailoring industry',
      'Specializes in bridal and occasion wear',
      'Passionate about quality craftsmanship'
    ],
    icon: Crown,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-100'
  }
]

export function Team() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Meet Our Team
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our passionate team of expert tailors and designers is dedicated to bringing your vision to life
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {teamMembers.map((member, index) => {
            const Icon = member.icon
            return (
              <div key={index} className="space-y-8">
                {/* Team Member Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <div className={`${member.bgColor} w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <Icon className={`h-12 w-12 ${member.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-lg font-semibold text-purple-600 mb-2">
                    {member.role}
                  </p>
                  <p className="text-gray-600 mb-6">
                    {member.description}
                  </p>
                  
                  <div className="space-y-3">
                    {member.achievements.map((achievement, achievementIndex) => (
                      <div key={achievementIndex} className="flex items-center text-gray-700">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        <span className="text-sm">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Heart className="h-6 w-6 text-pink-500 mr-3" />
                    <h4 className="text-lg font-semibold text-gray-900">Our Mission</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    At SilaiWala, we believe that every piece of clothing should tell a story. 
                    Our founder Rutuja brings years of expertise in women&rsquo;s fashion, ensuring that 
                    every garment we create reflects your unique style and personality.
                  </p>
                </div>
              </div>
            )
          })}

          {/* Team Values */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <Award className="h-6 w-6 text-blue-600 mr-3" />
                <h4 className="text-lg font-semibold text-gray-900">Quality Assurance</h4>
              </div>
              <p className="text-gray-700">
                Every garment undergoes rigorous quality checks to ensure perfect fit, 
                durability, and attention to detail.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <Crown className="h-6 w-6 text-purple-600 mr-3" />
                <h4 className="text-lg font-semibold text-gray-900">Expert Craftsmanship</h4>
              </div>
              <p className="text-gray-700">
                Our team combines traditional tailoring techniques with modern design 
                principles to create timeless pieces.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <Heart className="h-6 w-6 text-pink-600 mr-3" />
                <h4 className="text-lg font-semibold text-gray-900">Personal Touch</h4>
              </div>
              <p className="text-gray-700">
                We work closely with each client to understand their vision and bring 
                their dream outfit to life.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
