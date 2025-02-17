'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number;
  category: 'personal' | 'professional' | 'health' | 'relationships' | 'learning';
  emotionalState: 'excited' | 'motivated' | 'challenged' | 'accomplished';
  milestones: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

interface ContentRecommendation {
  id: string;
  title: string;
  type: 'inspiration' | 'guide' | 'story' | 'exercise';
  emotionalTone: 'motivational' | 'supportive' | 'challenging' | 'celebratory';
  source: string;
  preview: string;
}

export default function GoalTracker() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeGoal, setActiveGoal] = useState<string | null>(null);
  const [showAddGoal, setShowAddGoal] = useState(false);

  const emotionColors = {
    excited: 'bg-yellow-100 text-yellow-800',
    motivated: 'bg-green-100 text-green-800',
    challenged: 'bg-purple-100 text-purple-800',
    accomplished: 'bg-blue-100 text-blue-800'
  };

  const categoryIcons = {
    personal: '🎯',
    professional: '💼',
    health: '💪',
    relationships: '❤️',
    learning: '📚'
  };

  return (
    <section className="py-12 bg-gradient-to-r from-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Your Growth Journey</h2>
          <p className="mt-2 text-lg text-gray-600">Set goals, track progress, and get inspired</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{categoryIcons[goal.category]}</span>
                    <h3 className="text-xl font-semibold text-gray-900">{goal.title}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${emotionColors[goal.emotionalState]}`}>
                    {goal.emotionalState}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{goal.description}</p>
                
                {/* Progress Bar */}
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                        Progress
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-indigo-600">
                        {goal.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                    <div
                      style={{ width: `${goal.progress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                    />
                  </div>
                </div>

                {/* Milestones */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Milestones</h4>
                  <div className="space-y-2">
                    {goal.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={milestone.completed}
                          onChange={() => {
                            // Update milestone completion
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className={`text-sm ${milestone.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                          {milestone.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => setActiveGoal(activeGoal === goal.id ? null : goal.id)}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    {activeGoal === goal.id ? 'Hide Content' : 'Show Inspiring Content'}
                  </button>
                </div>

                {/* Recommended Content */}
                {activeGoal === goal.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t"
                  >
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Curated Content for You</h4>
                    <div className="space-y-3">
                      {/* This would be populated with actual recommendations */}
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">5 Steps to Achieve Your {goal.category} Goals</h5>
                            <p className="text-xs text-gray-500 mt-1">Inspirational Guide • 5 min read</p>
                          </div>
                          <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                            98% match
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Add Goal Button */}
          <motion.button
            onClick={() => setShowAddGoal(true)}
            className="h-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center p-6 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <span className="block text-4xl mb-2">✨</span>
              <span className="text-gray-600 hover:text-indigo-600">Start a New Growth Journey</span>
            </div>
          </motion.button>
        </div>
      </div>
    </section>
  );
}
