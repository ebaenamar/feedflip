'use client';

import { useState } from 'react';
import { useProgress } from '@/hooks/useProgress';

const inputClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white/50 backdrop-blur-sm hover:bg-white transition-colors";

export default function GoalForm() {
  const { addGoal } = useProgress();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    addGoal({
      title,
      description,
      target: {
        energy: 80,
        positivity: 80,
        clarity: 80,
        confidence: 80
      }
    });

    setTitle('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative bg-white rounded-xl shadow-lg p-4 sm:p-6 max-w-3xl mx-auto backdrop-blur-sm bg-white/90">
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-white opacity-50 rounded-xl -z-10" />
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Set a New Goal</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Goal Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClasses}
            placeholder="e.g., Learn Public Speaking"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClasses}
            placeholder="What do you want to achieve?"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            Add Goal
          </button>
        </div>
      </div>
    </form>
  );
}
