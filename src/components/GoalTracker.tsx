'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGoals, EmotionalState } from '@/hooks/useGoals';
import GoalModal from './GoalModal';
import EmotionalChart from './EmotionalChart';





export default function GoalTracker() {
  const { goals, activeGoalId, setActiveGoal, updateGoal } = useGoals();
  const [showAddGoal, setShowAddGoal] = useState(false);

  const getEmotionalStateColor = (state: EmotionalState) => {
    const avgPositivity = state.current.positivity;
    const avgEnergy = state.current.energy;
    
    if (avgEnergy > 70 && avgPositivity > 70) return 'bg-yellow-100 text-yellow-800'; // Excited
    if (avgEnergy > 70 && avgPositivity < 30) return 'bg-red-100 text-red-800';     // Anxious
    if (avgEnergy < 30 && avgPositivity < 30) return 'bg-blue-100 text-blue-800';   // Sad
    if (avgEnergy < 30 && avgPositivity > 70) return 'bg-green-100 text-green-800'; // Content
    return 'bg-purple-100 text-purple-800'; // Neutral
  };

  const getEmotionalStateLabel = (state: EmotionalState) => {
    const avgPositivity = state.current.positivity;
    const avgEnergy = state.current.energy;
    
    if (avgEnergy > 70 && avgPositivity > 70) return 'Excited';
    if (avgEnergy > 70 && avgPositivity < 30) return 'Anxious';
    if (avgEnergy < 30 && avgPositivity < 30) return 'Down';
    if (avgEnergy < 30 && avgPositivity > 70) return 'Content';
    return 'Neutral';
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{categoryIcons[goal.category]}</span>
                    <h3 className="text-xl font-semibold text-gray-900">{goal.title}</h3>
                  </div>
                  <div className="space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${getEmotionalStateColor(goal.emotionalStates[0])}`}>
                      {getEmotionalStateLabel(goal.emotionalStates[0])}
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2 text-xs text-gray-500">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span>Energy</span>
                          <span>{goal.emotionalStates[0].current.energy}%</span>
                        </div>
                        <div className="h-1 bg-gray-200 rounded overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500" 
                            style={{ width: `${goal.emotionalStates[0].current.energy}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span>Positivity</span>
                          <span>{goal.emotionalStates[0].current.positivity}%</span>
                        </div>
                        <div className="h-1 bg-gray-200 rounded overflow-hidden">
                          <div 
                            className="h-full bg-green-500" 
                            style={{ width: `${goal.emotionalStates[0].current.positivity}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
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
                            const updatedMilestones = [...goal.milestones];
                            updatedMilestones[parseInt(milestone.id)] = {
                              ...milestone,
                              completed: !milestone.completed
                            };
                            updateGoal(goal.id, { milestones: updatedMilestones });
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

                <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => setActiveGoal(activeGoalId === goal.id ? null : goal.id)}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    {activeGoalId === goal.id ? 'Hide Content' : 'Show Inspiring Content'}
                  </button>
                </div>

                {/* Recommended Content */}
                {activeGoalId === goal.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t space-y-4"
                  >
                    <EmotionalChart 
                      emotionalStates={goal.emotionalStates}
                      goalId={goal.id}
                    />
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

        <GoalModal 
          isOpen={showAddGoal}
          onClose={() => setShowAddGoal(false)}
        />
      </div>
    </section>
  );
}
