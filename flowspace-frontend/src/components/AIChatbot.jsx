import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Brain, 
  X, 
  Send, 
  Minimize2, 
  Trash2,
  Plus,
  Target,
  Calendar,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

const quickActions = [
  "What should I focus on today?",
  "Plan my week",
  "I'm feeling overwhelmed — help me prioritize",
  "Create a task: [describe in natural language]",
  "Suggest improvements for my tasks",
  "Show my productivity summary"
];

export default function AIChatbot() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  // Debug: Check if component is rendering
  console.log('AIChatbot - Component is rendering!');
  console.log('AIChatbot - User:', user ? 'Available' : 'Not available');
  console.log('AIChatbot - isDark:', isDark);

  // Load chat history from localStorage
  useEffect(() => {
    if (user) {
      const savedHistory = localStorage.getItem(`ai_chat_${user._id}`);
      if (savedHistory) {
        try {
          const history = JSON.parse(savedHistory);
          setMessages(history.slice(-50)); // Keep last 50 messages
        } catch (error) {
          console.error('Error loading chat history:', error);
        }
      }
    }
  }, [user]);

  // Save chat history to localStorage
  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(`ai_chat_${user._id}`, JSON.stringify(messages));
    }
  }, [messages, user]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Fetch user data for AI context
  const fetchUserData = useCallback(async () => {
    try {
      const [tasksRes, remindersRes, habitsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/reminders'),
        api.get('/habits')
      ]);

      const tasks = tasksRes.data.data || [];
      const reminders = remindersRes.data.data || [];
      const habits = habitsRes.data.data || [];

      const today = new Date();
      const overdueTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate < today && task.status !== 'completed';
      });

      return {
        userName: user?.name || 'User',
        todayDate: today.toISOString().split('T')[0],
        dayOfWeek: today.toLocaleDateString('en-US', { weekday: 'long' }),
        currentTime: today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        tasksJSON: JSON.stringify(tasks),
        remindersJSON: JSON.stringify(reminders),
        habitsJSON: JSON.stringify(habits),
        plannerJSON: JSON.stringify([]), // Will implement planner data later
        overdueCount: overdueTasks.length,
        taskCount: tasks.length,
        reminderCount: reminders.length
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }, [user]);

  // Parse XML tags from AI response
  const parseXMLTags = (text) => {
    const createItemRegex = /<create_item>(.*?)<\/create_item>/s;
    const weeklyPlanRegex = /<weekly_plan>(.*?)<\/weekly_plan>/s;
    
    const createItemMatch = text.match(createItemRegex);
    const weeklyPlanMatch = text.match(weeklyPlanRegex);
    
    let cleanText = text;
    const parsedItems = [];
    const weeklyPlan = null;

    if (createItemMatch) {
      try {
        const itemData = JSON.parse(createItemMatch[1]);
        parsedItems.push(itemData);
        cleanText = cleanText.replace(createItemRegex, '');
      } catch (error) {
        console.error('Error parsing create_item XML:', error);
      }
    }

    if (weeklyPlanMatch) {
      weeklyPlan = weeklyPlanMatch[1];
      cleanText = cleanText.replace(weeklyPlanRegex, '');
    }

    return { cleanText, parsedItems, weeklyPlan };
  };

  // Create task/reminder from parsed XML
  const createItemFromXML = async (itemData) => {
    try {
      const endpoint = itemData.type === 'reminder' ? '/reminders' : '/tasks';
      const response = await api.post(endpoint, itemData);
      
      // Add success message to chat
      const successMessage = {
        id: Date.now(),
        type: 'system',
        content: `✅ ${itemData.type === 'reminder' ? 'Reminder' : 'Task'} created: "${itemData.title}"`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, successMessage]);
      toast.success(`${itemData.type === 'reminder' ? 'Reminder' : 'Task'} created successfully!`);
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Failed to create item');
    }
  };

  // Send message to AI
  const sendMessage = async (message) => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowQuickActions(false);
    setIsLoading(true);

    try {
      const userData = await fetchUserData();
      if (!userData) {
        throw new Error('Failed to fetch user data');
      }

      // Build conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // System prompt with user data
      const systemPrompt = `You are FlowSpace AI, a smart personal productivity assistant built into the user's planner app. You are warm, concise, and actionable — never vague or overly verbose.

You have full context of the user's current data (provided below). Your capabilities:
1. Answer any productivity or general question
2. Prioritize tasks based on urgency + importance matrix
3. Suggest breaking large/vague tasks into smaller subtasks
4. Improve poorly written task descriptions when asked
5. Plan the user's week with a realistic daily schedule
6. Give motivational nudges based on overdue or missed items
7. Parse natural language into structured tasks or reminders
8. Suggest new habits based on the user's goals and patterns
9. Warn if the user is overloaded (too many high-priority tasks today)

When creating a task or reminder from natural language, include this EXACT XML in your response (the app will parse and add it):
<create_item>{
  "type": "task" | "reminder",
  "title": "...",
  "description": "...",
  "priority": "High" | "Medium" | "Low",
  "category": "Work" | "Personal" | "Health" | "Finance" | "Learning" | "Other",
  "dueDate": "YYYY-MM-DD",
  "dueTime": "HH:MM",
  "repeat": "once" | "daily" | "weekly" | "monthly"
}</create_item>

When suggesting a weekly plan, use this format:
<weekly_plan>
Monday: Morning - [task title] | Afternoon - [task title] | Evening - free
Tuesday: ...
</weekly_plan>

Current user data:
NAME: ${userData.userName}
DATE: ${userData.todayDate} (${userData.dayOfWeek})
TIME: ${userData.currentTime}
TIMEZONE: ${userData.timezone}

TASKS (${userData.taskCount} total):
${userData.tasksJSON}

REMINDERS (${userData.reminderCount} total):
${userData.remindersJSON}

HABITS:
${userData.habitsJSON}

PLANNER (this week):
${userData.plannerJSON}

OVERDUE TASKS: ${userData.overdueCount}`;

      // Call Anthropic API
      const response = await api.post('/ai/chat', {
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-10), // Keep last 10 messages for context
          { role: 'user', content: message }
        ],
        max_tokens: 1000
      });

      const aiContent = response.data.content;
      const { cleanText, parsedItems, weeklyPlan } = parseXMLTags(aiContent);

      const aiMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: cleanText.trim(),
        timestamp: new Date().toISOString(),
        parsedItems,
        weeklyPlan
      };

      setMessages(prev => [...prev, aiMessage]);

      // Create items from parsed XML
      for (const item of parsedItems) {
        await createItemFromXML(item);
      }

      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Check if it's an API key issue
      if (error.response?.status === 500 || error.message?.includes('API key')) {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'system',
          content: `🤖 **AI Chatbot Setup Required**

The AI chatbot needs an Anthropic API key to work. Here's how to set it up:

1. **Get API Key**: Go to [console.anthropic.com](https://console.anthropic.com)
2. **Sign up** for a free account (you get $5 free credit)
3. **Generate API Key** in the dashboard
4. **Add to .env file**: \`ANTHROPIC_API_KEY=sk-ant-your-key-here\`
5. **Restart backend server**

The chatbot will be able to:
- Create tasks from natural language
- Plan your weekly schedule
- Give productivity advice
- Help prioritize your work

For now, you can still use all other FlowSpace features! 🚀`,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'system',
          content: 'AI is temporarily unavailable. Please try again later.',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, errorMessage]);
        toast.error('Failed to get AI response');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick action click
  const handleQuickAction = (action) => {
    if (action.includes('[') && action.includes(']')) {
      // For natural language task creation, focus input
      setInputValue(action);
      inputRef.current?.focus();
    } else {
      sendMessage(action);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    if (user) {
      localStorage.removeItem(`ai_chat_${user._id}`);
    }
    toast.success('Chat history cleared');
  };

  // Render message content with markdown-like formatting
  const renderMessageContent = (content) => {
    // Simple markdown-like rendering
    let processedContent = content;
    
    // Bold text
    processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic text
    processedContent = processedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Code blocks
    processedContent = processedContent.replace(/```(.*?)```/gs, '<pre class="bg-gray-800 text-gray-100 p-2 rounded text-sm overflow-x-auto"><code>$1</code></pre>');
    
    // Inline code
    processedContent = processedContent.replace(/`(.*?)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 rounded text-sm">$1</code>');
    
    // Bullet points
    processedContent = processedContent.replace(/^• (.*?)$/gm, '<li class="ml-4">• $1</li>');
    
    // Numbered lists
    processedContent = processedContent.replace(/^\d+\. (.*?)$/gm, '<li class="ml-4">$1</li>');
    
    return <div dangerouslySetInnerHTML={{ __html: processedContent }} />;
  };

  return (
    <>
      {/* Test div to verify rendering */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '60px',
        height: '60px',
        backgroundColor: 'red',
        borderRadius: '50%',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold'
      }}>
        AI
      </div>

      {/* Floating Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
          setUnreadCount(0);
          inputRef.current?.focus();
        }}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all duration-300 z-40 ${
          isDark ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-cyan-500 hover:bg-cyan-600'
        } text-white relative group`}
      >
        {/* Pulsing ring animation */}
        <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-75" />
        
        {/* Brain icon */}
        <Brain size={24} className="relative z-10" />
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
            {unreadCount}
          </div>
        )}
        
        {/* Tooltip */}
        <div className={`absolute bottom-full right-0 mb-2 px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${
          isDark ? 'bg-gray-800 text-white' : 'bg-gray-800 text-white'
        }`}>
          FlowSpace AI
        </div>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${isDark ? 'bg-black/50' : 'bg-black/30'}`}>
          <div 
            className={`w-full max-w-2xl h-[600px] max-h-[90vh] rounded-xl shadow-2xl flex flex-col ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border m-4`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <Brain className={isDark ? 'text-cyan-400' : 'text-cyan-600'} size={24} />
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  FlowSpace AI
                </h2>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={clearChat}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                  title="Clear chat"
                >
                  <Trash2 size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                </button>
                
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                  title="Minimize"
                >
                  <Minimize2 size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                </button>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                  title="Close"
                >
                  <X size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
                  isDark ? 'bg-gray-900/50' : 'bg-gray-50'
                }`}>
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <Brain size={48} className={isDark ? 'text-cyan-400' : 'text-cyan-600'} />
                      <h3 className={`text-lg font-semibold mt-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Hello! I'm FlowSpace AI
                      </h3>
                      <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        I can help you manage tasks, plan your week, and boost your productivity.
                      </p>
                    </div>
                  )}

                  {/* Quick Actions */}
                  {showQuickActions && messages.length === 0 && (
                    <div className="space-y-2">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickAction(action)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors text-sm ${
                            isDark 
                              ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300' 
                              : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Messages */}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-cyan-500 text-white'
                            : message.type === 'system'
                              ? isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                              : isDark ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'
                        }`}
                      >
                        <div className="text-sm">
                          {renderMessageContent(message.content)}
                        </div>
                        
                        {/* Parsed items */}
                        {message.parsedItems && message.parsedItems.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.parsedItems.map((item, index) => (
                              <div key={index} className={`text-xs p-2 rounded ${
                                isDark ? 'bg-gray-600' : 'bg-gray-100'
                              }`}>
                                <strong>Created:</strong> {item.title}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Weekly plan */}
                        {message.weeklyPlan && (
                          <div className={`mt-2 p-2 rounded text-sm whitespace-pre-line ${
                            isDark ? 'bg-gray-600' : 'bg-gray-100'
                          }`}>
                            {message.weeklyPlan}
                          </div>
                        )}
                        
                        <div className={`text-xs mt-1 opacity-70 ${
                          message.type === 'user' ? 'text-cyan-100' : isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className={`p-3 rounded-lg ${
                        isDark ? 'bg-gray-700' : 'bg-white'
                      }`}>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className={`p-4 border-t ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask me anything about your productivity..."
                      className={`flex-1 resize-none rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      rows={1}
                      style={{ minHeight: '40px', maxHeight: '120px' }}
                    />
                    
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isLoading}
                      className={`p-2 rounded-lg transition-colors ${
                        inputValue.trim() && !isLoading
                          ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                          : isDark 
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
