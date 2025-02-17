import { create } from 'zustand';

export type EmotionalDimension = 'energy' | 'positivity' | 'clarity' | 'confidence';

export interface EmotionalState {
  current: {
    [key in EmotionalDimension]: number; // 0-100
  };
  target: {
    [key in EmotionalDimension]: number; // 0-100
  };
  timestamp: Date;
  note?: string;
}

interface ContentSuggestion {
  type: 'inspiration' | 'guidance' | 'reflection' | 'action';
  priority: number; // 0-100
  reason: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number;
  category: 'personal' | 'professional' | 'health' | 'relationships' | 'learning';
  emotionalStates: EmotionalState[];
  currentContent?: ContentSuggestion;
  milestones: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

interface GoalStore {
  goals: Goal[];
  activeGoalId: string | null;
  addGoal: (goal: Omit<Goal, 'id' | 'emotionalStates' | 'currentContent'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  setActiveGoal: (id: string | null) => void;
  updateEmotionalState: (goalId: string, state: Omit<EmotionalState, 'timestamp'>) => void;
  getRecommendedContent: (goalId: string) => ContentSuggestion | undefined;
}

export const useGoals = create<GoalStore>((set, get) => ({
  goals: [],
  activeGoalId: null,
  addGoal: (goal) =>
    set((state) => ({
      goals: [...state.goals, { 
        ...goal, 
        id: Date.now().toString(),
        emotionalStates: [{
          current: goal.emotional || { energy: 50, positivity: 50, clarity: 50, confidence: 50 },
          target: { energy: 80, positivity: 80, clarity: 80, confidence: 80 },
          timestamp: new Date()
        }],
        currentContent: undefined
      }],
    })),
  updateGoal: (id, updates) =>
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    })),
  deleteGoal: (id) =>
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
    })),
  setActiveGoal: (id) =>
    set(() => ({
      activeGoalId: id,
    })),

  updateEmotionalState: (goalId, state) =>
    set((store) => ({
      goals: store.goals.map(goal =>
        goal.id === goalId
          ? {
              ...goal,
              emotionalStates: [
                {
                  ...state,
                  timestamp: new Date()
                },
                ...goal.emotionalStates
              ]
            }
          : goal
      )
    })),

  getRecommendedContent: (goalId) =>
    get().goals.find(g => g.id === goalId)?.currentContent,
}));
