import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { goalsAPI } from '../services/api';

// A more refined map of icons
const goalIconsMap = {
  'skill': '🧠',
  'growth': '🌱',
  'relax': '🧘',
  'fiction': '✨',
  'career': '💼',
  'health': '💪',
  'creativity': '🎨',
  'history': '🏛️',
  'science': '🔬',
  'default': '📖'
};

const GoalsPage = () => {
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user, updateUserGoals } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // This is a protected page, redirect if not logged in
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
      toast.error('Failed to load goals from the server.');
    }
    setLoading(false);
  };

  const ProgressDots = ({ count, total = 3 }) => (
    <div className="flex justify-center gap-2 my-4">
        {[...Array(total)].map((_, i) => (
            <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i < count ? 'bg-golden' : 'bg-gray-300'
                }`}
            />
        ))}
    </div>
);


  const getGoalIcon = (goalName) => {
    const lowerGoalName = goalName.toLowerCase();
    for (const [key, icon] of Object.entries(goalIconsMap)) {
      if (lowerGoalName.includes(key)) {
        return icon;
      }
    }
    return goalIconsMap.default;
  };

  const handleGoalSelect = (goalId) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId) // Deselect if already selected
        : [...prev, goalId] // Select if not selected
    );
  };
  
  const handleSaveGoals = async () => {
    if (selectedGoals.length < 3) {
      toast.warn('Please select at least 3 goals to get started.');
      return;
    }
    setSaving(true);
    const result = await goalsAPI.selectGoals(selectedGoals); // Note: plural 'selectGoals'
    if (result.success) {
      updateUserGoals();
      toast.success('Your goals have been saved!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Failed to save goals.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-4 font-sans animate-fade-in">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl font-bold text-emerald mb-4">
            What do you want to read for?
          </h1>
          <p className="text-xl text-gray-600">
            Select at least 3 goals to get personalized recommendations
          </p>
          <ProgressDots count={selectedGoals.length} total={3} />
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No goals available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => handleGoalSelect(goal.id)}
                className={`p-6 rounded-lg border-2 transition-all duration-300 text-center ${
                  selectedGoals.includes(goal.id)
                    ? 'border-emerald bg-emerald-50 shadow-lg scale-105'
                    : 'border-gray-200 bg-white hover:border-emerald hover:shadow-md'
                }`}
              >
                <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-600">
  {getGoalIcon(goal.name)}
</div>

                <h3 className="font-serif text-base font-bold text-gray-600">
                  {goal.name}
                </h3>
                {/* Placeholder for description if available */}
                {/* <p className="text-sm text-gray-500 mt-1">Short description here</p> */}
              </button>
            ))}
          </div>
        )}

        <div className="text-center">
          <button
            onClick={handleSaveGoals}
            disabled={selectedGoals.length < 3 || saving}
            className="px-12 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg bg-golden text-navy disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-yellow-500"
          >
            {saving ? 'Saving...' : 'Continue to Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;