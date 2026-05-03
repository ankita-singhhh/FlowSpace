import { useState } from 'react';
import { 
  Loader2, 
  Wand2, 
  RotateCcw, 
  Target, 
  Clock, 
  Calendar,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const skillLevels = ['Beginner', 'Intermediate', 'Advanced'];
const dailyTimes = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '60 min', value: 60 },
  { label: '90 min', value: 90 }
];
const goalTypes = ['Study', 'Build Project', 'Exam Prep', 'Skill Learning'];
const durations = [
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
  { label: '60 days', value: 60 },
  { label: '90 days', value: 90 }
];

export default function GoalInputForm({ onGoalCreated }) {
  const { isDark } = useTheme();
  const [userInput, setUserInput] = useState('');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [goalType, setGoalType] = useState('Study');
  const [totalDays, setTotalDays] = useState(30);
  
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [showEnhancedPreview, setShowEnhancedPreview] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const handleEnhancePrompt = async () => {
    if (!userInput.trim()) {
      toast.error('Please describe what you want to achieve');
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await api.post('/goals/enhance-prompt', {
        userInput,
        skillLevel,
        dailyMinutes,
        goalType
      });

      if (response.data.success) {
        setEnhancedPrompt(response.data.data.enhancedPrompt);
        setShowEnhancedPreview(true);
      }
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      toast.error('Failed to enhance your goal');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!enhancedPrompt.trim()) {
      toast.error('Please enhance your goal first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await api.post('/goals/generate-plan', {
        enhancedPrompt,
        totalDays,
        skillLevel,
        dailyMinutes,
        goalType
      });

      if (response.data.success) {
        setGeneratedPlan(response.data.data);
        onGoalCreated(response.data.data.goal);
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      toast.error('Failed to generate your plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartOver = () => {
    setUserInput('');
    setEnhancedPrompt('');
    setShowEnhancedPreview(false);
    setGeneratedPlan(null);
  };

  if (generatedPlan) {
    return (
      <div className={`max-w-2xl mx-auto p-8 rounded-2xl ${isDark ? 'bg-gray-800/50 backdrop-blur-lg border border-gray-700' : 'bg-white/50 backdrop-blur-lg border border-gray-200'}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {generatedPlan.goal.title}
          </h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            {generatedPlan.goal.description}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
              <div className="text-2xl font-bold text-blue-600">{generatedPlan.goal.totalDays}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Days</div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
              <div className="text-2xl font-bold text-green-600">{generatedPlan.tasks.length}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tasks</div>
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/tasks'}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Today
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur-lg border border-gray-700' : 'bg-white/50 backdrop-blur-lg border border-gray-200'}`}>
        <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          What do you want to achieve?
        </h2>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="e.g., Learn React and build a portfolio project"
          className={`w-full h-32 p-4 rounded-lg resize-none ${isDark ? 'bg-gray-700/50 text-white border-gray-600 placeholder-gray-400' : 'bg-gray-50 text-gray-900 border-gray-300'} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        />
      </div>

      {/* Selection Chips */}
      <div className="space-y-4">
        {/* Skill Level */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Skill Level
          </label>
          <div className="flex flex-wrap gap-2">
            {skillLevels.map(level => (
              <button
                key={level}
                onClick={() => setSkillLevel(level)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  skillLevel === level
                    ? 'bg-blue-600 text-white'
                    : isDark 
                      ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Time */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Daily Time Commitment
          </label>
          <div className="flex flex-wrap gap-2">
            {dailyTimes.map(time => (
              <button
                key={time.value}
                onClick={() => setDailyMinutes(time.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  dailyMinutes === time.value
                    ? 'bg-blue-600 text-white'
                    : isDark 
                      ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {time.label}
              </button>
            ))}
          </div>
        </div>

        {/* Goal Type */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Goal Type
          </label>
          <div className="flex flex-wrap gap-2">
            {goalTypes.map(type => (
              <button
                key={type}
                onClick={() => setGoalType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  goalType === type
                    ? 'bg-blue-600 text-white'
                    : isDark 
                      ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Duration
          </label>
          <div className="flex flex-wrap gap-2">
            {durations.map(duration => (
              <button
                key={duration.value}
                onClick={() => setTotalDays(duration.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  totalDays === duration.value
                    ? 'bg-blue-600 text-white'
                    : isDark 
                      ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {duration.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Button */}
      {!showEnhancedPreview && (
        <button
          onClick={handleEnhancePrompt}
          disabled={isEnhancing || !userInput.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isEnhancing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enhancing...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Enhance My Goal
            </>
          )}
        </button>
      )}

      {/* Enhanced Preview */}
      {showEnhancedPreview && (
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur-lg border border-gray-700' : 'bg-white/50 backdrop-blur-lg border border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Enhanced Goal Description
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Original Input
              </label>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/30 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                {userInput}
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                AI-Enhanced Description
              </label>
              <textarea
                value={enhancedPrompt}
                onChange={(e) => setEnhancedPrompt(e.target.value)}
                className={`w-full h-24 p-3 rounded-lg resize-none ${isDark ? 'bg-gray-700/50 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  Looks good — Generate Plan
                </>
              )}
            </button>
            <button
              onClick={handleStartOver}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Loading Animation */}
      {isGenerating && (
        <div className={`p-8 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur-lg border border-gray-700' : 'bg-white/50 backdrop-blur-lg border border-gray-200'}`}>
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Generating your plan...
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              AI is creating a personalized learning journey for you
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
