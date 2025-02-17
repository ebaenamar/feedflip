import { EmotionalState, EmotionalDimension } from '@/hooks/useGoals';

interface TrendAnalysis {
  dimension: EmotionalDimension;
  change: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  message: string;
}

export function analyzeTrends(states: EmotionalState[]): TrendAnalysis[] {
  if (states.length < 2) return [];

  const dimensions: EmotionalDimension[] = ['energy', 'positivity', 'clarity', 'confidence'];
  
  return dimensions.map(dimension => {
    const current = states[0].current[dimension];
    const previous = states[states.length - 1].current[dimension];
    const change = current - previous;
    const trend = change > 2 ? 'increasing' : change < -2 ? 'decreasing' : 'stable';

    const getMessage = (change: number, trend: string) => {
      const timeFrame = states.length > 3 ? 'this week' : 'recently';
      
      if (trend === 'stable') return `Your ${dimension} has been stable ${timeFrame}`;
      
      const magnitude = Math.abs(change) > 20 ? 'significantly ' : '';
      const direction = change > 0 ? 'increased' : 'decreased';
      
      return `Your ${dimension} has ${magnitude}${direction} by ${Math.abs(Math.round(change))}% ${timeFrame}`;
    };

    return {
      dimension,
      change,
      trend,
      message: getMessage(change, trend)
    };
  });
}

export function compareGoals(goalA: EmotionalState[], goalB: EmotionalState[]): Record<EmotionalDimension, number> {
  const dimensions: EmotionalDimension[] = ['energy', 'positivity', 'clarity', 'confidence'];
  
  return dimensions.reduce((acc, dimension) => {
    const avgA = goalA[0]?.current[dimension] ?? 0;
    const avgB = goalB[0]?.current[dimension] ?? 0;
    acc[dimension] = avgA - avgB;
    return acc;
  }, {} as Record<EmotionalDimension, number>);
}

interface GoalRecommendation {
  type: 'new-goal' | 'milestone' | 'habit' | 'content';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggestedCategory?: string;
}

export function generateRecommendations(states: EmotionalState[]): GoalRecommendation[] {
  if (states.length < 2) return [];
  const recommendations: GoalRecommendation[] = [];

  const current = states[0].current;
  const trends = analyzeTrends(states);

  // Check for low energy patterns
  if (current.energy < 40) {
    recommendations.push({
      type: 'new-goal',
      title: 'Energy Boost Goal',
      description: 'Set a goal to incorporate more energizing activities into your routine',
      priority: 'high',
      reason: 'Your energy levels have been consistently low',
      suggestedCategory: 'health'
    });
  }

  // Check for low positivity
  if (current.positivity < 40) {
    recommendations.push({
      type: 'content',
      title: 'Positivity Boost',
      description: 'We recommend exploring uplifting content and success stories',
      priority: 'high',
      reason: 'Your positivity could use a boost'
    });
  }

  // Check for improvement opportunities
  trends.forEach(({ dimension, trend }) => {
    if (trend === 'decreasing') {
      recommendations.push({
        type: 'milestone',
        title: `${dimension.charAt(0).toUpperCase() + dimension.slice(1)} Check-in`,
        description: `Set aside time to reflect on what's affecting your ${dimension}`,
        priority: 'medium',
        reason: `Your ${dimension} has been declining`
      });
    }
  });

  // Suggest habits based on patterns
  if (current.clarity < 60) {
    recommendations.push({
      type: 'habit',
      title: 'Daily Reflection',
      description: 'Spend 5 minutes each day journaling about your progress',
      priority: 'medium',
      reason: 'Regular reflection can help improve mental clarity'
    });
  }

  return recommendations;
}

export function exportEmotionalData(states: EmotionalState[]): string {
  const data = states.map(state => ({
    date: new Date(state.timestamp).toISOString(),
    ...state.current,
    targetEnergy: state.target.energy,
    targetPositivity: state.target.positivity,
    targetClarity: state.target.clarity,
    targetConfidence: state.target.confidence,
    note: state.note
  }));

  const headers = [
    'date',
    'energy',
    'positivity',
    'clarity',
    'confidence',
    'targetEnergy',
    'targetPositivity',
    'targetClarity',
    'targetConfidence',
    'note'
  ];

  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => 
        JSON.stringify(row[header as keyof typeof row] || '')
      ).join(',')
    )
  ];

  return csvRows.join('\n');
}

export function getEmotionColor(dimension: EmotionalDimension): string {
  const colors = {
    energy: '#6366f1',    // Indigo
    positivity: '#22c55e', // Green
    clarity: '#f59e0b',    // Amber
    confidence: '#8b5cf6'  // Purple
  };
  return colors[dimension];
}
