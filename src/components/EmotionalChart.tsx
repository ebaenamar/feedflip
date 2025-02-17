'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoals } from '@/hooks/useGoals';
import { analyzeTrends, compareGoals, getEmotionColor, generateRecommendations, exportEmotionalData } from '@/utils/emotionalAnalysis';
import { EmotionalState } from '@/hooks/useGoals';

interface EmotionalChartProps {
  emotionalStates: EmotionalState[];
  goalId: string;
}

export default function EmotionalChart({ emotionalStates, goalId }: EmotionalChartProps) {
  const { goals } = useGoals();
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; metric: string; value: number } | null>(null);
  const [compareWithGoalId, setCompareWithGoalId] = useState<string | null>(null);

  const trends = useMemo(() => analyzeTrends(emotionalStates), [emotionalStates]);
  
  const comparisonData = useMemo(() => {
    if (!compareWithGoalId) return null;
    const compareGoal = goals.find(g => g.id === compareWithGoalId);
    if (!compareGoal) return null;
    return compareGoals(emotionalStates, compareGoal.emotionalStates);
  }, [compareWithGoalId, emotionalStates, goals]);

  const recommendations = useMemo(() => 
    generateRecommendations(emotionalStates),
    [emotionalStates]
  );

  const handleExport = () => {
    const csv = exportEmotionalData(emotionalStates);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'emotional-data.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const chartData = useMemo(() => {
    return emotionalStates.slice(0, 7).reverse().map((state) => ({
      date: new Date(state.timestamp).toLocaleDateString(),
      energy: state.current.energy,
      positivity: state.current.positivity,
      clarity: state.current.clarity,
      confidence: state.current.confidence,
    }));
  }, [emotionalStates]);

  return (
    <div className="mt-4 p-3 sm:p-4 bg-white rounded-lg shadow overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h4 className="text-sm font-medium text-gray-900">Emotional Journey</h4>
        <button
          onClick={handleExport}
          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Data
        </button>
      </div>
      
      {/* Trend Analysis */}
      <div className="mb-6 space-y-2 text-xs sm:text-sm">
        {trends.map(({ dimension, message, trend }) => (
          <div key={dimension} className="flex items-center space-x-2 text-sm">
            <div 
              className={`w-2 h-2 rounded-full`}
              style={{ backgroundColor: getEmotionColor(dimension) }}
            />
            <span className={`
              ${trend === 'increasing' ? 'text-green-600' : ''}
              ${trend === 'decreasing' ? 'text-red-600' : ''}
              ${trend === 'stable' ? 'text-gray-600' : ''}
            `}>
              {message}
            </span>
          </div>
        ))}
      </div>

      {/* Goal Comparison */}
      <div className="mb-6">
        <select
          value={compareWithGoalId || ''}
          onChange={(e) => setCompareWithGoalId(e.target.value || null)}
          className="w-full p-2 text-xs sm:text-sm border rounded"
        >
          <option value="">Compare with another goal...</option>
          {goals.filter(g => g.id !== goalId).map(goal => (
            <option key={goal.id} value={goal.id}>{goal.title}</option>
          ))}
        </select>

        {comparisonData && (
          <div className="mt-4 space-y-2">
            {Object.entries(comparisonData).map(([dimension, difference]) => (
              <div key={dimension} className="flex items-center justify-between text-sm">
                <span className="capitalize">{dimension}</span>
                <span className={difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-gray-600'}>
                  {difference > 0 ? '+' : ''}{Math.round(difference)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {['energy', 'positivity', 'clarity', 'confidence'].map((metric) => (
          <div key={metric} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 capitalize">{metric}</span>
              <span className="text-xs text-gray-600">
                {chartData[chartData.length - 1]?.[metric]}%
              </span>
            </div>
            <div className="relative h-2 bg-gray-100 rounded">
              {chartData.map((point, index) => {
                const previousPoint = chartData[index - 1];
                if (!previousPoint) return null;

                const startX = `${(index - 1) * (100 / (chartData.length - 1))}%`;
                const endX = `${index * (100 / (chartData.length - 1))}%`;
                const startY = `${100 - previousPoint[metric]}%`;
                const endY = `${100 - point[metric]}%`;

                return (
                  <svg
                    key={point.date}
                    className="absolute inset-0 h-full w-full"
                    preserveAspectRatio="none"
                  >
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke={
                        metric === 'energy' ? '#6366f1' :
                        metric === 'positivity' ? '#22c55e' :
                        metric === 'clarity' ? '#f59e0b' :
                        '#8b5cf6'
                      }
                      strokeWidth="2"
                    />
                    <g
                      onMouseEnter={() => setHoveredPoint({ 
                        date: point.date, 
                        metric, 
                        value: point[metric] 
                      })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <circle
                        cx={endX}
                        cy={endY}
                        r="4"
                        fill="white"
                        stroke={
                        metric === 'energy' ? '#6366f1' :
                        metric === 'positivity' ? '#22c55e' :
                        metric === 'clarity' ? '#f59e0b' :
                        '#8b5cf6'
                      }
                        strokeWidth="2"
                      />
                    </g>
                  </svg>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 overflow-x-auto">
              {chartData.map((point) => (
                <span key={point.date}>{point.date}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Recommended Actions</h4>
          <div className="space-y-3 overflow-x-auto pb-2">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border p-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        rec.type === 'new-goal' ? 'bg-purple-100 text-purple-800' :
                        rec.type === 'milestone' ? 'bg-green-100 text-green-800' :
                        rec.type === 'habit' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {rec.type}
                      </span>
                    </div>
                    <h5 className="font-medium text-gray-900 mt-2">{rec.title}</h5>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    <p className="text-xs text-gray-500 mt-2">Why? {rec.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {[
          { label: 'Energy', color: '#6366f1' },
          { label: 'Positivity', color: '#22c55e' },
          { label: 'Clarity', color: '#f59e0b' },
          { label: 'Confidence', color: '#8b5cf6' }
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
