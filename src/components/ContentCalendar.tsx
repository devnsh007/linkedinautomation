import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit3,
  Trash2
} from 'lucide-react';

interface ScheduledPost {
  id: number;
  title: string;
  type: 'post' | 'article' | 'carousel';
  status: 'scheduled' | 'published' | 'draft';
  date: string;
  time: string;
}

export const ContentCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const scheduledPosts: ScheduledPost[] = [
    {
      id: 1,
      title: "AI Marketing Trends 2025",
      type: 'article',
      status: 'scheduled',
      date: '2025-01-28',
      time: '09:00'
    },
    {
      id: 2,
      title: "Leadership Tips for Remote Teams",
      type: 'carousel',
      status: 'scheduled',
      date: '2025-01-30',
      time: '14:00'
    },
    {
      id: 3,
      title: "Company Culture Insights",
      type: 'post',
      status: 'draft',
      date: '2025-02-01',
      time: '11:00'
    },
    {
      id: 4,
      title: "Digital Transformation Success Story",
      type: 'post',
      status: 'published',
      date: '2025-01-25',
      time: '10:30'
    }
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getPostsForDate = (date: string) => {
    return scheduledPosts.filter(post => post.date === date);
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = formatDate(date);
      const postsForDay = getPostsForDate(dateString);
      const isToday = dateString === formatDate(new Date());
      const isSelected = selectedDate && formatDate(selectedDate) === dateString;

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-32 p-2 border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
            isToday ? 'bg-blue-50 border-blue-200' : ''
          } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {postsForDay.slice(0, 2).map((post) => (
              <div
                key={post.id}
                className={`text-xs px-2 py-1 rounded-full text-white truncate ${
                  post.status === 'published' ? 'bg-green-500' :
                  post.status === 'scheduled' ? 'bg-blue-500' :
                  'bg-gray-400'
                }`}
              >
                {post.time} - {post.title}
              </div>
            ))}
            {postsForDay.length > 2 && (
              <div className="text-xs text-gray-500 px-2">
                +{postsForDay.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'draft':
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article':
        return 'bg-purple-100 text-purple-700';
      case 'carousel':
        return 'bg-green-100 text-green-700';
      case 'post':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
          <p className="text-gray-600 mt-1">Plan and schedule your LinkedIn content.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Schedule Post</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-gray-100">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-4 text-center font-medium text-gray-700 bg-gray-50 border-r border-gray-100 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {renderCalendarDays()}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Posts</h3>
            <div className="space-y-3">
              {scheduledPosts
                .filter(post => new Date(post.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map((post) => (
                  <div key={post.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(post.type)}`}>
                        {post.type}
                      </span>
                      {getStatusIcon(post.status)}
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{post.title}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                      <span>{post.time}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">This Month</span>
                <span className="font-semibold text-gray-900">
                  {scheduledPosts.filter(post => 
                    new Date(post.date).getMonth() === currentDate.getMonth()
                  ).length} posts
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Scheduled</span>
                <span className="font-semibold text-blue-600">
                  {scheduledPosts.filter(post => post.status === 'scheduled').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Drafts</span>
                <span className="font-semibold text-gray-600">
                  {scheduledPosts.filter(post => post.status === 'draft').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Published</span>
                <span className="font-semibold text-green-600">
                  {scheduledPosts.filter(post => post.status === 'published').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};