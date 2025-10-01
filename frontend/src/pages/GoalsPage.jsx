import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const goalOptions = [
  {
    id: 'learn',
    title: 'Learn a New Skill',
    icon: '📚',
    description: 'Expand your knowledge and capabilities'
  },
  {
    id: 'growth',
    title: 'Self-Growth',
    icon: '🌱',
    description: 'Personal development and mindfulness'
  },
  {
    id: 'relax',
    title: 'Relaxation',
    icon: '🧘',
    description: 'Unwind with calming reads'
  },
  {
    id: 'fiction',
    title: 'Fiction Journey',
    icon: '✨',
    description: 'Escape into imaginative worlds'
  },
  {
    id: 'business',
    title: 'Business & Career',
    icon: '💼',
    description: 'Professional growth and leadership'
  },
  {
    id: 'health',
    title: 'Health & Wellness',
    icon: '💪',
    description: 'Physical and mental wellbeing'
  },
  {
    id: 'creativity',
    title: 'Creativity & Arts',
    icon: '🎨',
    description: 'Inspire your creative side'
  },
  {
    id: 'history',
    title: 'History & Culture',
    icon: '🏛️',
    description: 'Explore the past and diverse cultures'
  },
  {
    id: 'science',
    title: 'Science & Technology',
    icon: '🔬',
    description: 'Discover innovations and breakthroughs'
  }
];

const GoalsPage = () => {
  const [selectedGoals, setSelectedGoals] = useState([]);
  const { updateUserGoals } = useAuth();
  const navigate = useNavigate();

  const toggleGoal = (goalId) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleSaveGoals = async () => {
    if (selectedGoals.length < 3) {
      alert('Please select at least 3 goals');
      return;
    }

    updateUserGoals(selectedGoals);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="font-serif text-5xl font-bold text-gray-800 dark:text-white mb-4">
            What are your reading goals?
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Select at least 3 to get personalized recommendations
          </p>
          <div className="mt-4">
            <div className="inline-block bg-emerald-100 dark:bg-emerald-900 px-6 py-2 rounded-full">
              <span className="text-emerald-800 dark:text-emerald-200 font-medium">
                {selectedGoals.length} / 3 minimum selected
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 animate-slide-up">
          {goalOptions.map((goal) => (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                selectedGoals.includes(goal.id)
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900 dark:border-emerald-400 shadow-lg scale-105'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-emerald-400 hover:shadow-md'
              }`}
            >
              <div className="text-4xl mb-3">{goal.icon}</div>
              <h3 className="font-serif text-xl font-bold text-gray-800 dark:text-white mb-2">
                {goal.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {goal.description}
              </p>
              {selectedGoals.includes(goal.id) && (
                <div className="mt-3 flex items-center text-emerald-600 dark:text-emerald-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm font-medium">Selected</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleSaveGoals}
            disabled={selectedGoals.length < 3}
            className={`px-12 py-4 rounded-lg font-medium text-lg transition-all shadow-lg ${
              selectedGoals.length >= 3
                ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-700 hover:to-blue-700 hover:shadow-xl'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            Save Goals & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;
