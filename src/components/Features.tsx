'use client';

import { BeakerIcon, LightBulbIcon, GlobeAltIcon, SparklesIcon } from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Goal-Aligned Content',
    description: {
      main: 'Transform your social feed into a source of motivation and guidance.',
      details: [
        'Find content that matches your goals',
        'Discover success stories and tips',
        'Learn from relevant experiences'
      ]
    },
    icon: BeakerIcon,
  },
  {
    name: 'Mindful Consumption',
    description: {
      main: 'Make social media work for your mental wellbeing.',
      details: [
        'Filter out negative content',
        'Focus on uplifting stories',
        'Balance entertainment and growth'
      ]
    },
    icon: SparklesIcon,
  },
  {
    name: 'Smart Discovery',
    description: {
      main: 'Find the right content at the right time.',
      details: [
        'Personalized recommendations',
        'Trending growth content',
        'Expert advice and insights'
      ]
    },
    icon: LightBulbIcon,
  },
  {
    name: 'Community Learning',
    description: {
      main: 'Connect with others on similar growth journeys.',
      details: [
        'Find relatable experiences',
        'Share progress and insights',
        'Learn from peer success stories'
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
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Social Media for Growth</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Feed Your Future Self
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Turn your social media time into personal growth time. Discover content that inspires, motivates, and guides you toward your goals.
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
