import React from 'react';
import { PARENT_STATS } from '../constants';
import { BarChart2, Calendar, Award, Clock, ChevronRight } from 'lucide-react';

export const ParentPortal: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Parent Dashboard</h2>
            <p className="text-gray-500">Tracking progress for <span className="font-semibold text-gray-800">Eva</span></p>
        </div>
        <button className="text-sm text-primary-600 font-medium hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-lg transition-colors">
            Download Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PARENT_STATS.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                <div className="text-gray-500 text-sm font-medium mb-1">{stat.label}</div>
                <div className="flex items-end gap-3 mt-auto">
                    <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                    <span className={`text-sm font-medium mb-1 ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                        {stat.trend}
                    </span>
                </div>
            </div>
        ))}
      </div>

      {/* Main Analysis Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <BarChart2 size={20} className="text-gray-400" />
                    Activity Overview
                </h3>
                <select className="bg-gray-50 border border-gray-200 rounded-lg text-sm px-3 py-1 text-gray-600">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                </select>
            </div>
            
            {/* Mock Chart Visual */}
            <div className="h-64 flex items-end justify-between gap-2 px-2">
                {[40, 65, 30, 85, 50, 90, 60].map((h, i) => (
                    <div key={i} className="w-full flex flex-col items-center gap-2 group cursor-pointer">
                        <div 
                            className="w-full bg-primary-100 rounded-t-lg relative group-hover:bg-primary-500 transition-colors duration-300" 
                            style={{ height: `${h}%` }}
                        >
                             <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {h}m
                             </div>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                        </span>
                    </div>
                ))}
            </div>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
             {/* Weekly Goals */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Award size={20} className="text-yellow-500" />
                    Weekly Goals
                </h3>
                <div className="space-y-4">
                    <GoalItem label="Complete 5 Lessons" current={3} total={5} color="bg-green-500" />
                    <GoalItem label="Practice Speaking" current={12} total={20} unit="min" color="bg-blue-500" />
                    <GoalItem label="Learn New Words" current={8} total={10} color="bg-purple-500" />
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                 <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-gray-400" />
                    Recent Activity
                </h3>
                <div className="space-y-4">
                    <ActivityItem title="Completed 'My Family'" time="2h ago" score="100%" />
                    <ActivityItem title="Speaking Practice" time="Yesterday" score="85%" />
                    <ActivityItem title="Quiz: Colors" time="2 days ago" score="90%" />
                </div>
                <button className="w-full mt-4 text-sm text-gray-500 hover:text-gray-900 font-medium flex items-center justify-center gap-1 transition-colors">
                    View Full History <ChevronRight size={16} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

const GoalItem = ({ label, current, total, unit = '', color }: any) => {
    const percent = Math.min(100, Math.round((current / total) * 100));
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 font-medium">{label}</span>
                <span className="text-gray-900 font-bold">{current}/{total}{unit}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
            </div>
        </div>
    )
}

const ActivityItem = ({ title, time, score }: any) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
        <div>
            <div className="text-sm font-semibold text-gray-800">{title}</div>
            <div className="text-xs text-gray-400">{time}</div>
        </div>
        <div className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
            {score}
        </div>
    </div>
)