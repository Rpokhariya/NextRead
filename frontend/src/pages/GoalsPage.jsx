import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { goalsAPI } from '../services/api';

const goalIconsMap = {
  'Learn New Skill': '📚',
  'Self-Growth': '🌱',
  'Relaxation': '🧘',
  'Fiction': '✨',
  'Business': '💼',
  'Health': '💪',
  'Creativity': '🎨',
  'History': '🏛️',
  'Science': '🔬',
  'default': '📖'
};

const GoalsPage = () => {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user, updateUserGoals } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadGoals();
  }, [user, navigate]);

  const loadGoals = async () => {
    setLoading(true);
    const result = await goalsAPI.getAll();

    if (result.success && result.data.length > 0) {
      setGoals(result.data);
    } else {
      toast.error('Failed to load goals');
      setGoals([]);
    }
    setLoading(false);
  };

  const getGoalIcon = (goalName) => {
    for (const [key, icon] of Object.entries(goalIconsMap)) {
      if (goalName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return goalIconsMap.default;
  };

  const handleSaveGoal = async () => {
    if (!selectedGoal) {
      toast.warning('Please select a goal');
      return;
    }

    setSaving(true);
    const result = await goalsAPI.selectGoal(selectedGoal);

    if (result.success) {
      updateUserGoals();
      toast.success('Goal saved successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Failed to save goal');
    }
    setSaving(false);
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="text-center mb-12 animate-fade-in">
          <h1 className="font-serif text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Choose Your Reading Goal
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Select what you want to achieve through reading
          </p>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No goals available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 animate-slide-up">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className={`p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                  selectedGoal === goal.id
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900 dark:border-emerald-400 shadow-lg scale-105'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-emerald-400 hover:shadow-md'
                }`}
              >
                <div className="text-4xl mb-3">{getGoalIcon(goal.name)}</div>
                <h3 className="font-serif text-xl font-bold text-gray-800 dark:text-white mb-2">
                  {goal.name}
                </h3>
                {selectedGoal === goal.id && (
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
        )}

        <div className="text-center">
          <button
            onClick={handleSaveGoal}
            disabled={!selectedGoal || saving}
            className={`px-12 py-4 rounded-lg font-medium text-lg transition-all shadow-lg ${
              selectedGoal && !saving
                ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-700 hover:to-blue-700 hover:shadow-xl'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving...' : 'Save Goal & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;
