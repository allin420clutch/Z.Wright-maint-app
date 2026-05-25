'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Wrench, Settings, Activity, Tag, FileText, History, X } from 'lucide-react';
import Link from 'next/link';
import { equipmentService, Equipment } from '@/lib/services/equipment';
import { workOrdersService, WorkOrder } from '@/lib/services/workOrders';
import { useAuth } from '@/lib/contexts/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { QRCodeSVG } from 'qrcode.react';

export default function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { hasPermission, currentUser } = useAuth();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'Operational' | 'Warning' | 'Down'>('Operational');
  const [statusReason, setStatusReason] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eqData, woData] = await Promise.all([
          equipmentService.getById(resolvedParams.id),
          workOrdersService.getByEquipmentId(resolvedParams.id)
        ]);
        setEquipment(eqData);
        setWorkOrders(woData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [resolvedParams.id]);

  const handleUpdateStatus = async () => {
    if (!currentUser || !statusReason.trim()) return;
    setIsUpdatingStatus(true);
    try {
      await equipmentService.updateStatus(resolvedParams.id, newStatus, statusReason, currentUser.name);
      setIsStatusModalOpen(false);
      setStatusReason('');
      
      // refresh equipment
      const eqData = await equipmentService.getById(resolvedParams.id);
      setEquipment(eqData);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this equipment? This action is irreversible.')) {
      try {
        await equipmentService.delete(resolvedParams.id);
        router.push('/equipment');
      } catch (error) {
        console.error('Failed to delete equipment:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="text-center p-12">
        <h2 className="text-2xl font-bold text-white mb-2">Equipment Not Found</h2>
        <Link href="/equipment" className="text-amber-500 hover:underline">Return to Database</Link>
      </div>
    );
  }

  // Generate some mock historical data based on the current health, or use 100 as base
  const baseHealth = equipment.health || 100;
  const historyData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const randomVariation = Math.floor(Math.random() * 10) - 5;
    let score = baseHealth + randomVariation;
    if (score > 100) score = 100;
    if (i === 5) score = baseHealth; // current month matches exact base health
    return {
      name: d.toLocaleString('default', { month: 'short' }),
      score
    };
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/equipment" className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors border border-zinc-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest border ${
                equipment.status === 'Operational' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                equipment.status === 'Warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                'bg-red-500/10 text-red-500 border-red-500/20'
              }`}>
                {equipment.status}
              </span>
              {hasPermission('edit_equipment') && (
                <button 
                  onClick={() => {
                    setNewStatus(equipment.status);
                    setIsStatusModalOpen(true);
                  }}
                  className="text-[10px] text-zinc-500 hover:text-amber-500 flex items-center gap-1 transition-colors uppercase font-bold tracking-widest"
                >
                  <Edit className="w-3 h-3" /> Update Status
                </button>
              )}
            </div>
            <h1 className="text-4xl font-light tracking-tight text-white uppercase">{equipment.name}</h1>
            <p className="text-zinc-500 mt-1 uppercase font-mono text-sm tracking-widest">ID: {resolvedParams.id} {'//'} {equipment.location}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
           {hasPermission('delete_equipment') && (
             <button onClick={handleDelete} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-all active:scale-95" title="Delete Asset">
               <Trash2 className="h-5 w-5" />
             </button>
           )}
           {hasPermission('edit_equipment') && (
             <Link href={`/equipment/edit/${resolvedParams.id}`} className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider text-sm rounded-xl transition-all active:scale-95 flex items-center border border-zinc-700">
               <Edit className="h-4 w-4 mr-2" />
               Edit Profile
             </Link>
           )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Details */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-zinc-800 rounded-2xl border border-zinc-700 p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Hardware Specifications
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-4">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Type</p>
                <p className="text-lg font-medium text-white mt-1 uppercase tracking-wide">{equipment.type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Manufacturer</p>
                <p className="text-lg font-medium text-white mt-1 uppercase tracking-wide">{equipment.manufacturer || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Model</p>
                <p className="text-lg font-medium text-white mt-1 uppercase tracking-wide">{equipment.model || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Serial Number</p>
                <p className="text-lg font-mono text-zinc-300 mt-1">{equipment.serialNumber || 'N/A'}</p>
              </div>
            </div>
            
            {equipment.tags && equipment.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-zinc-700">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Maintenance Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {equipment.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm font-medium rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-zinc-800 rounded-2xl border border-zinc-700 p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Health History
            </h2>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 10', 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '0.75rem', color: '#f4f4f5' }}
                    itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                    formatter={(value: any) => [`${value}%`, 'Health Score']}
                  />
                  <Area type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-zinc-800 rounded-2xl border border-zinc-700 p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Service History
            </h2>
            
            {workOrders.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-sm border border-dashed border-zinc-700 rounded-xl">
                No service history found.
              </div>
            ) : (
              <div className="relative border-l border-zinc-700 ml-3 space-y-6">
                {workOrders.map((wo) => (
                  <div key={wo.id} className="relative pl-6">
                    <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                      wo.status === 'Completed' ? 'bg-emerald-500' :
                      wo.status === 'In Progress' ? 'bg-amber-500' :
                      wo.status === 'Review' ? 'bg-purple-500' :
                      'bg-zinc-500'
                    }`} />
                    
                    <Link href={`/work-orders/${wo.id}`} className="block group">
                      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 hover:border-zinc-500 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-zinc-500">{wo.displayId}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest border ${
                              wo.priority === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                              wo.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                              'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            }`}>
                              {wo.priority}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {new Date(wo.createdAt?.seconds ? wo.createdAt.seconds * 1000 : wo.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-white group-hover:text-amber-500 transition-colors mb-2">{wo.issue}</h4>
                        <div className="flex justify-between items-center">
                           <span className="text-xs text-zinc-400">Assigned: {wo.assignee}</span>
                           <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest ${
                            wo.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                            wo.status === 'In Progress' ? 'bg-amber-500/10 text-amber-500' :
                            wo.status === 'Review' ? 'bg-purple-500/10 text-purple-500' :
                            'bg-zinc-700 text-zinc-300'
                          }`}>
                            {wo.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-zinc-800 rounded-2xl border border-zinc-700 p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
              <History className="w-4 h-4" /> Status History
            </h2>
            
            {(!equipment.statusHistory || equipment.statusHistory.length === 0) ? (
              <div className="text-center py-8 text-zinc-500 text-sm border border-dashed border-zinc-700 rounded-xl">
                No status history available.
              </div>
            ) : (
              <div className="space-y-4">
                {equipment.statusHistory.map((entry, idx) => (
                  <div key={idx} className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest border ${
                          entry.status === 'Operational' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          entry.status === 'Warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {entry.status}
                        </span>
                        <span className="text-xs font-bold text-amber-500/80">{entry.author}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {entry.reason && (
                      <p className="text-sm text-zinc-300 mt-2 pl-1 whitespace-pre-wrap">{entry.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
           <button className="flex-1 min-h-[80px] bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-widest text-lg rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg shadow-amber-500/20">
             <Wrench className="w-6 h-6" />
             Create Work Order
          </button>
          
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 flex flex-col">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Diagnostic Context</h3>
            
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex flex-col items-center justify-center mb-4 text-center">
               <div className="bg-white p-2 rounded-lg">
                 <QRCodeSVG 
                   value={`/equipment/${resolvedParams.id}`} 
                   size={120}
                   level="H"
                   includeMargin={false}
                 />
               </div>
               <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-3">Scan for Asset Profile</p>
            </div>
            
            <div className="mt-auto space-y-3">
              <div className="flex justify-between items-center border-b border-zinc-700 pb-2">
                <span className="text-xs uppercase font-bold text-zinc-500">Asset Health</span>
                <span className="font-mono font-bold text-emerald-500 lg:text-lg">{equipment.health || 100}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-bold text-zinc-500">Last Synced</span>
                <span className="font-mono text-zinc-400 text-xs">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-zinc-700 flex justify-between items-center bg-zinc-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-amber-500" />
                Update Asset Status
              </h3>
              <button 
                onClick={() => setIsStatusModalOpen(false)}
                className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-zinc-300 transition-colors"
                disabled={isUpdatingStatus}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">New Status</label>
                <select 
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as 'Operational' | 'Warning' | 'Down')}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
                  disabled={isUpdatingStatus}
                >
                  <option value="Operational">Operational</option>
                  <option value="Warning">Warning</option>
                  <option value="Down">Down</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Reason / Notes <span className="text-red-500">*</span></label>
                <textarea 
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Explain why the status is changing..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 h-32 resize-none"
                  disabled={isUpdatingStatus}
                />
              </div>

              <button 
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus || !statusReason.trim()}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-widest text-base rounded-xl transition-all disabled:opacity-50"
              >
                {isUpdatingStatus ? 'Updating...' : 'Confirm Status Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
