import React from 'react';
import { Brain, Navigation, ShieldCheck, MessageSquare, Activity } from 'lucide-react';

const AIInsightsPanel = ({ insights }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-sm border-l-4 border-blue-600">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          AI Intelligence
        </h3>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-500 flex items-center gap-2 text-sm">
                <Navigation className="w-4 h-4" /> Estimated Range
              </span>
              <span className="font-bold text-blue-600 text-xl">{insights.range_prediction} km</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${(insights.range_prediction / 400) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Health Score</p>
                <p className="text-xs text-slate-500">Real-time status</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-green-600">{insights.health_score}%</span>
          </div>

          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${insights.driving_behavior === 'Aggressive' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Driving Style</p>
                <p className="text-xs text-slate-500">{insights.driving_behavior}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Suggestion
            </p>
            <p className="text-sm text-slate-700">{insights.suggestions}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPanel;
