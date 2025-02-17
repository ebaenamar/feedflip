'use client';

import { BeakerIcon, LightBulbIcon, GlobeAltIcon, SparklesIcon } from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Emotional Intelligence',
    description: {
      main: 'Track and understand your emotional journey towards your goals.',
      details: [
        'Monitor emotional states and patterns',
        'Get personalized emotional support',
        'Build resilience through guided content'
      ]
    },
    icon: SparklesIcon,
  },
  {
    name: 'Goal Achievement',
    description: {
      main: 'Set and achieve meaningful goals with structured support.',
      details: [
        'Break down goals into actionable steps',
        'Track progress with visual metrics',
        'Celebrate milestones and achievements'
      ]
    },
    icon: BeakerIcon,
  },
  {
    name: 'Curated Inspiration',
    description: {
      main: 'Discover content that aligns with your personal growth journey.',
      details: [
        'Get motivation from success stories',
        'Learn from expert insights and advice',
        'Find relatable experiences and guidance'
      ]
    },
    icon: LightBulbIcon,
  },
  {
    name: 'Holistic Growth',
    description: {
      main: 'Develop all aspects of your future self through balanced content.',
      details: [
        'Personal and professional development',
        'Mental and emotional wellbeing',
        'Social and relationship growth'
      ]
    },
    icon: GlobeAltIcon,
  },
];



export default function Features() {
  return (
    <div id="features" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Your Growth Journey</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Become Your Best Self
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Transform social media into a powerful tool for personal growth. Set meaningful goals, track your progress, and get the emotional support you need.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature, index) => (
              <div 
                key={feature.name}
                style={{ animationDelay: `${index * 100}ms` }}
                className="relative opacity-0 animate-fadeIn"
              >
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  <p>{feature.description.main}</p>
                  <ul className="mt-2 space-y-1 text-sm list-disc pl-4">
                    {feature.description.details.map((detail, i) => (
                      <li key={i}>{detail}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
