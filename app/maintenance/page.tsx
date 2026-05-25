import { Calendar, CheckCircle2, RotateCw, AlertTriangle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function MaintenancePage() {
  const pmTasks = [
    { id: 'PM-102', equip: 'Conveyor Line A', task: 'Belt Tension & Tracking Check', freq: 'Weekly', due: 'Today', status: 'Due', timeEst: '30m' },
    { id: 'PM-103', equip: 'CNC Lathe 3', task: 'Coolant Flush & Filter Change', freq: 'Monthly', due: 'Tomorrow', status: 'Upcoming', timeEst: '1h 15m' },
    { id: 'PM-104', equip: 'Air Compressor 2', task: 'Oil Analysis & Filter Check', freq: 'Quarterly', due: 'Overdue', status: 'Overdue', timeEst: '2h' },
    { id: 'PM-105', equip: 'Packaging Robot B', task: 'Joint Lubrication (Axes 1-6)', freq: 'Bi-Weekly', due: 'In 3 Days', status: 'Upcoming', timeEst: '45m' },
    { id: 'PM-106', equip: 'HVAC Unit Roof-1', task: 'Filter Replacement', freq: 'Monthly', due: 'Completed', status: 'Completed', timeEst: '20m' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-zinc-100">PM Schedule</h1>
          <p className="text-zinc-500 mt-1 uppercase font-mono text-sm tracking-widest">Preventive maintenance and inspections.</p>
        </div>
        <div className="flex gap-2">
            <button className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 border border-zinc-700 text-sm">
                Generate Schedule
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
         <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-sm font-bold text-red-500 mb-1 flex items-center gap-1"><AlertTriangle className="h-4 w-4"/> Overdue</span>
            <span className="text-3xl font-mono">1</span>
         </div>
         <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-sm font-bold text-amber-500 mb-1 flex items-center gap-1"><Calendar className="h-4 w-4"/> Due This Week</span>
            <span className="text-3xl font-mono">8</span>
         </div>
         <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-sm font-bold text-emerald-500 mb-1 flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/> PM Compliance</span>
            <span className="text-3xl font-mono">94%</span>
         </div>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-2xl overflow-hidden shadow-sm">
        <ul className="divide-y divide-zinc-700">
            {pmTasks.map((task) => (
                <li key={task.id} className="p-4 hover:bg-zinc-900/50 transition-colors group cursor-pointer flex items-center justify-between">
                    <div className="flex items-start gap-4">
                        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                            task.status === 'Overdue' ? 'bg-red-500' :
                            task.status === 'Due' ? 'bg-amber-500' :
                            task.status === 'Completed' ? 'bg-emerald-500' :
                            'bg-blue-500'
                        }`} />
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-zinc-100">{task.equip}</h3>
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-700">{task.id}</span>
                            </div>
                            <p className="text-zinc-300 text-sm mt-0.5">{task.task}</p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                                <span className="flex items-center gap-1"><RotateCw className="h-3 w-3"/> {task.freq}</span>
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/> Due: {task.due}</span>
                                <span className="flex items-center gap-1">Est: {task.timeEst}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {task.status !== 'Completed' && (
                            <button className="hidden sm:block px-4 py-2 bg-zinc-900 hover:bg-amber-500 hover:text-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors border border-zinc-700 hover:border-amber-500 active:scale-95">
                                Start PM
                            </button>
                        )}
                        <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-amber-500 transition-colors" />
                    </div>
                </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
