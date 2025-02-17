'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useProgress, Goal } from '@/hooks/useProgress';

export default function ProgressChart() {
  const { goals, currentGoal, getGoalProgress, setCurrentGoal } = useProgress();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  useEffect(() => {
    if (goals.length && currentGoal) {
      setSelectedGoal(goals.find(g => g.id === currentGoal) || goals[0]);
    }
  }, [goals, currentGoal]);

  if (!selectedGoal) return null;

  const progress = getGoalProgress(selectedGoal.id);
  const latest = selectedGoal.progress[0];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 max-w-3xl mx-auto backdrop-blur-sm bg-white/90">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white opacity-50 rounded-xl -z-10" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">Your Progress</h2>
        <select
          value={selectedGoal.id}
          onChange={(e) => {
            const goal = goals.find(g => g.id === e.target.value);
            if (goal) {
              setSelectedGoal(goal);
              setCurrentGoal(goal.id);
            }
          }}
          className="w-full sm:w-auto p-2 border rounded-md text-gray-600 bg-white/50 backdrop-blur-sm hover:bg-white transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {goals.map(goal => (
            <option key={goal.id} value={goal.id}>
              {goal.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        <div className="relative pt-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                Overall Progress
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-indigo-600">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-indigo-500 to-indigo-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Energy</span>
              <span className="text-sm text-indigo-600">{latest.energy}/100</span>
            </div>
            <div className="h-2 bg-indigo-200 rounded">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${latest.energy}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-indigo-500 rounded"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Positivity</span>
              <span className="text-sm text-indigo-600">{latest.positivity}/100</span>
            </div>
            <div className="h-2 bg-indigo-200 rounded">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${latest.positivity}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-indigo-500 rounded"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Clarity</span>
              <span className="text-sm text-indigo-600">{latest.clarity}/100</span>
            </div>
            <div className="h-2 bg-indigo-200 rounded">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${latest.clarity}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-indigo-500 rounded"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Confidence</span>
              <span className="text-sm text-indigo-600">{latest.confidence}/100</span>
            </div>
            <div className="h-2 bg-indigo-200 rounded">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${latest.confidence}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-indigo-500 rounded"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500 bg-indigo-50/50 p-4 rounded-lg backdrop-blur-sm">
          <p className="font-medium">Goal: {selectedGoal.description}</p>
          <p className="mt-1">Last updated: {new Date(latest.timestamp).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
