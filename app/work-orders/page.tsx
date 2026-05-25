'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Plus, FileText, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { workOrdersService, WorkOrder } from '@/lib/services/workOrders';

const timeAgo = (date: any) => {
  if (!date) return 'Just now';
  const num = date.toMillis ? date.toMillis() : date;
  // Use a fixed timestamp or just simple calculation if it's outside. But taking Date.now outside is fine.
  const diff = Date.now() - num;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hrs ago`;
  return `${Math.floor(hours/24)} days ago`;
};

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const filteredWorkOrders = workOrders.filter(wo => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = wo.displayId?.toLowerCase().includes(q) || 
                    wo.equipmentName?.toLowerCase().includes(q) ||
                    wo.issue.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== 'All' && wo.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && wo.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'All') {
      const isUnassig = !wo.assignee || wo.assignee === 'Unassigned';
      if (assigneeFilter === 'Unassigned') {
        if (!isUnassig) return false;
      } else {
        if (wo.assignee !== assigneeFilter) return false;
      }
    }
    return true;
  });

  useEffect(() => {
    async function fetchWorkOrders() {
      try {
        const data = await workOrdersService.getAll();
        setWorkOrders(data);
      } catch (error) {
        console.error('Failed to fetch work orders:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchWorkOrders();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-zinc-100">Work Orders</h1>
          <p className="text-zinc-500 mt-1 uppercase font-mono text-sm tracking-widest">14 open, 3 require attention.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search WO..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-full py-2 pl-9 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
            />
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-xl transition-all flex items-center border border-zinc-700 ${showFilters ? 'border-amber-500/50 text-white' : ''}`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {(statusFilter !== 'All' || priorityFilter !== 'All' || assigneeFilter !== 'All') && (
                <span className="ml-2 w-2 h-2 rounded-full bg-amber-500"></span>
              )}
            </button>
            {showFilters && (
              <div className="absolute right-0 mt-2 w-64 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl z-20 p-4 space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Status</label>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-2 px-3 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Priority</label>
                  <select 
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-2 px-3 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="All">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Assignee</label>
                  <select 
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-2 px-3 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="All">Any Assignee</option>
                    <option value="Unassigned">Unassigned</option>
                    <option value="Tech Jones">Tech Jones</option>
                    <option value="Sarah M.">Sarah M.</option>
                    <option value="Mike T.">Mike T.</option>
                    <option value="Alex Chen">Alex Chen</option>
                  </select>
                </div>
                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={() => { setStatusFilter('All'); setPriorityFilter('All'); setAssigneeFilter('All'); }}
                    className="text-xs text-zinc-400 hover:text-white uppercase tracking-wider font-bold"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <Link href="/work-orders/new" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-sm rounded-xl transition-all active:scale-95 flex flex-shrink-0 items-center">
            <Plus className="h-4 w-4 mr-2 hidden sm:block" />
            New WO
          </Link>
        </div>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-700 text-[10px] uppercase tracking-widest text-zinc-500 bg-zinc-900/50">
                <th className="p-4 font-medium pl-6">WO#</th>
                <th className="p-4 font-medium">Equipment / Issue</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Assignee</th>
                <th className="p-4 font-medium text-right pr-6">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500 uppercase font-bold tracking-widest text-sm">
                    Loading Work Orders...
                  </td>
                </tr>
              ) : filteredWorkOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500 uppercase font-bold tracking-widest text-sm">
                    No work orders found matching criteria.
                  </td>
                </tr>
              ) : filteredWorkOrders.map((wo) => (
                <tr 
                  key={wo.id} 
                  className="hover:bg-zinc-900/50 transition-colors group cursor-pointer"
                  onClick={() => window.location.href = `/work-orders/${wo.id}`}
                >
                  <td className="p-4 pl-6 align-top">
                    <div className="flex items-center flex-col sm:flex-row gap-2">
                       <span className="font-mono text-sm xl:text-base text-zinc-300 font-bold">{wo.displayId || wo.id?.slice(0, 8) || 'WO'}</span>
                       <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                         wo.priority === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                         wo.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                         'bg-zinc-900 text-zinc-400 border border-zinc-700'
                       }`}>
                         {wo.priority}
                       </span>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="font-bold text-zinc-100 group-hover:text-amber-500 transition-colors uppercase tracking-wide">{wo.equipmentName || 'Unknown'}</div>
                    <div className="text-sm text-zinc-400 line-clamp-1 mt-1">{wo.issue}</div>
                    {(wo.comments || 0) > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-zinc-500">
                        <MessageSquare className="h-3 w-3" /> {wo.comments} updates
                      </div>
                    )}
                  </td>
                  <td className="p-4 align-top">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                      wo.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      wo.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                      wo.status === 'Open' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-purple-500/10 text-purple-500 border-purple-500/20'
                    }`}>
                      {wo.status}
                    </span>
                  </td>
                  <td className="p-4 align-top text-sm">
                    <div className="flex items-center gap-2">
                      {wo.assignee !== 'Unassigned' ? (
                        <>
                          <div className="h-6 w-6 rounded-full bg-zinc-900 text-xs flex items-center justify-center font-bold text-zinc-300 border border-zinc-700">
                            {wo.assignee.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <span className="text-zinc-300">{wo.assignee}</span>
                        </>
                      ) : (
                        <span className="text-zinc-500 italic">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 pr-6 align-top text-right text-sm text-zinc-500 whitespace-nowrap">
                    {timeAgo(wo.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
