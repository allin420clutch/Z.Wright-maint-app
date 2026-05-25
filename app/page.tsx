import { ArrowRight, AlertTriangle, CheckCircle2, Clock, Activity, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const kpis = [
    { title: 'Open Work Orders', value: '14', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'PMs Due Today', value: '6', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Completed This Week', value: '42', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Avg Repair Time', value: '1.4h', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const recentWorkOrders = [
    { id: 'WO-2941', equip: 'Conveyor Line A', issue: 'Belt misalignment', status: 'In Progress', priority: 'High', time: '2 hrs ago' },
    { id: 'WO-2940', equip: 'CNC Lathe 3', issue: 'Spindle vibration', status: 'Open', priority: 'Medium', time: '4 hrs ago' },
    { id: 'WO-2939', equip: 'Air Compressor 2', issue: 'Pressure drop alarm', status: 'Review', priority: 'High', time: 'Yesterday' },
    { id: 'WO-2938', equip: 'Packaging Robot B', issue: 'Gripper sensor fault', status: 'Completed', priority: 'Low', time: 'Yesterday' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-zinc-100">Factory Overview</h1>
          <p className="text-zinc-500 mt-1 uppercase font-mono text-sm tracking-widest">Real-time maintenance capability status.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/work-orders/new" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-sm rounded-xl transition-all active:scale-95 flex items-center">
            New Work Order
          </Link>
          <Link href="/scanner" className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider text-sm rounded-xl transition-all active:scale-95 flex items-center border border-zinc-700">
            Scan QR
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.title} className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${kpi.bg}`}>
              <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">{kpi.title}</p>
              <p className="text-2xl font-bold text-zinc-100">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4 shadow-sm border border-zinc-700 bg-zinc-800 rounded-2xl p-1">
           <div className="flex items-center justify-between p-4 border-b border-zinc-700">
             <h2 className="text-lg font-bold">Active Work Orders</h2>
             <Link href="/work-orders" className="text-sm text-amber-500 hover:text-amber-400 flex items-center gap-1">
               View All <ArrowRight className="h-4 w-4" />
             </Link>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b gap-4 border-zinc-700 text-[10px] text-zinc-500 uppercase tracking-widest shrink-0">
                   <th className="p-4 font-medium">ID</th>
                   <th className="p-4 font-medium">Equipment</th>
                   <th className="p-4 font-medium">Issue</th>
                   <th className="p-4 font-medium">Status</th>
                   <th className="p-4 font-medium text-right">Time</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-zinc-700">
                 {recentWorkOrders.map((wo) => (
                   <tr key={wo.id} className="hover:bg-zinc-900/50 transition-colors group">
                     <td className="p-4 text-sm font-medium text-amber-500">{wo.id}</td>
                     <td className="p-4 text-sm font-medium text-zinc-200">{wo.equip}</td>
                     <td className="p-4 text-sm text-zinc-400 truncate max-w-[200px]">{wo.issue}</td>
                     <td className="p-4">
                       <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                         wo.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                         wo.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                         wo.status === 'Open' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                         'bg-purple-500/10 text-purple-500 border-purple-500/20'
                       }`}>
                         {wo.status}
                       </span>
                     </td>
                     <td className="p-4 text-sm text-zinc-500 text-right">{wo.time}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

        <div className="space-y-4 shadow-sm border border-zinc-700 bg-zinc-800 rounded-2xl p-5">
           <div className="flex items-center gap-2 pb-4 border-b border-zinc-700">
             <BarChart3 className="h-5 w-5 text-zinc-400" />
             <h2 className="text-lg font-bold">AI Diagnostics</h2>
           </div>
           
           <div className="space-y-4 mt-4">
             <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-700">
               <div className="flex items-center gap-2 text-amber-500 mb-2">
                 <AlertTriangle className="h-4 w-4" />
                 <span className="text-sm font-bold">Predictive Alert</span>
               </div>
               <p className="text-sm text-zinc-300">
                 <span className="font-semibold text-zinc-100">CNC Lathe 3</span> is showing vibration patterns similar to a spindle failure (87% match).
               </p>
               <button className="mt-3 text-sm text-amber-500 hover:text-amber-400 font-medium">Review AI Insights →</button>
             </div>

             <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-700">
               <div className="flex items-center justify-between mb-2">
                 <span className="text-sm font-bold text-zinc-400">Parts Inventory</span>
                 <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">Critical</span>
               </div>
               <p className="text-sm text-zinc-300">
                 Only 2x <span className="font-mono text-xs text-zinc-400">BRG-6204</span> (Bearings) remaining. Used heavily in last 3 weeks.
               </p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
