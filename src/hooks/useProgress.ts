import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EmotionalState {
  energy: number;    // 0-100
  positivity: number; // 0-100
  clarity: number;    // 0-100
  confidence: number; // 0-100
  timestamp: Date;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  target: {
    energy: number;
    positivity: number;
    clarity: number;
    confidence: number;
  };
  progress: EmotionalState[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProgressStore {
  goals: Goal[];
  currentGoal: string | null;
  addGoal: (goal: Omit<Goal, 'id' | 'progress' | 'createdAt' | 'updatedAt'>) => void;
  updateProgress: (goalId: string, state: Omit<EmotionalState, 'timestamp'>) => void;
  setCurrentGoal: (goalId: string | null) => void;
  getGoalProgress: (goalId: string) => number;
}

export const useProgress = create<ProgressStore>()(
  persist(
    (set, get) => ({
      goals: [],
      currentGoal: null,

      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, {
          ...goal,
          id: Date.now().toString(),
          progress: [{
            energy: 50,
            positivity: 50,
            clarity: 50,
            confidence: 50,
            timestamp: new Date()
          }],
          createdAt: new Date(),
          updatedAt: new Date()
        }],
        currentGoal: state.currentGoal || Date.now().toString()
      })),

      updateProgress: (goalId, state) => set((store) => ({
        goals: store.goals.map(goal =>
          goal.id === goalId
            ? {
                ...goal,
                progress: [
                  {
                    ...state,
                    timestamp: new Date()
                  },
                  ...goal.progress
                ],
                updatedAt: new Date()
              }
            : goal
        )
      })),

      setCurrentGoal: (goalId) => set({ currentGoal: goalId }),

      getGoalProgress: (goalId) => {
        const goal = get().goals.find(g => g.id === goalId);
        if (!goal || !goal.progress.length) return 0;

        const latest = goal.progress[0];
        const target = goal.target;

        // Calculate average progress across all metrics
        const energyProgress = (latest.energy / target.energy) * 100;
        const positivityProgress = (latest.positivity / target.positivity) * 100;
        const clarityProgress = (latest.clarity / target.clarity) * 100;
        const confidenceProgress = (latest.confidence / target.confidence) * 100;

        return Math.min(
          100,
          (energyProgress + positivityProgress + clarityProgress + confidenceProgress) / 4
        );
      }
    }),
    {
      name: 'goal-progress'
    }
  )
);
