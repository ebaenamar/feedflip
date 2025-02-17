'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoals } from '@/hooks/useGoals';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoalModal({ isOpen, onClose }: GoalModalProps) {
  const { addGoal } = useGoals();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal',
    targetDate: '',
    milestones: [''],
    emotional: {
      energy: 50,
      positivity: 50,
      clarity: 50,
      confidence: 50
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addGoal({
      title: formData.title,
      description: formData.description,
      category: formData.category as any,
      targetDate: new Date(formData.targetDate),
      progress: 0,
      emotionalState: 'excited',
      milestones: formData.milestones.map((title, index) => ({
        id: index.toString(),
        title,
        completed: false
      }))
    });
    onClose();
  };

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, '']
    }));
  };

  const updateMilestone = (index: number, value: string) => {
    const newMilestones = [...formData.milestones];
    newMilestones[index] = value;
    setFormData(prev => ({
      ...prev,
      milestones: newMilestones
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-25"
              onClick={onClose}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl rounded-lg bg-white p-6 shadow-xl"
            >
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Start Your New Journey</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Goal Title</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="personal">Personal Growth</option>
                    <option value="professional">Professional</option>
                    <option value="health">Health & Wellness</option>
                    <option value="relationships">Relationships</option>
                    <option value="learning">Learning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Date</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={formData.targetDate}
                    onChange={e => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Milestones</label>
                  <div className="space-y-2">
                    {formData.milestones.map((milestone, index) => (
                      <input
                        key={index}
                        type="text"
                        required
                        placeholder={`Milestone ${index + 1}`}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={milestone}
                        onChange={e => updateMilestone(index, e.target.value)}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={addMilestone}
                      className="mt-2 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      + Add Another Milestone
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">How are you feeling about this goal?</label>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Low Energy</span>
                        <span>High Energy</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.emotional.energy}
                        onChange={e => setFormData(prev => ({
                          ...prev,
                          emotional: {
                            ...prev.emotional,
                            energy: parseInt(e.target.value)
                          }
                        }))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Negative</span>
                        <span>Positive</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.emotional.positivity}
                        onChange={e => setFormData(prev => ({
                          ...prev,
                          emotional: {
                            ...prev.emotional,
                            positivity: parseInt(e.target.value)
                          }
                        }))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Confused</span>
                        <span>Clear</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.emotional.clarity}
                        onChange={e => setFormData(prev => ({
                          ...prev,
                          emotional: {
                            ...prev.emotional,
                            clarity: parseInt(e.target.value)
                          }
                        }))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Doubtful</span>
                        <span>Confident</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.emotional.confidence}
                        onChange={e => setFormData(prev => ({
                          ...prev,
                          emotional: {
                            ...prev.emotional,
                            confidence: parseInt(e.target.value)
                          }
                        }))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Create Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
