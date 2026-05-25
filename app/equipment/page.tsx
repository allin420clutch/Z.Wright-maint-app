'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, Plus, Zap, CheckCircle2, AlertCircle, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { equipmentService, Equipment } from '@/lib/services/equipment';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function EquipmentPage() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkActioning, setIsBulkActioning] = useState(false);
  const { hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchEquipment();
  }, []);

  async function fetchEquipment() {
    setIsLoading(true);
    try {
      const data = await equipmentService.getAll();
      setEquipmentList(data);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === equipmentList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(equipmentList.map(eq => eq.id as string)));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} assets?`)) return;
    setIsBulkActioning(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => equipmentService.delete(id)));
      setSelectedIds(new Set());
      await fetchEquipment();
    } catch (error) {
      console.error('Failed to delete assets:', error);
      alert('Failed to delete some assets.');
    } finally {
      setIsBulkActioning(false);
    }
  };

  const handleBulkMarkDown = async () => {
    if (!confirm(`Are you sure you want to mark ${selectedIds.size} assets as Down?`)) return;
    setIsBulkActioning(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => equipmentService.update(id, { status: 'Down' })));
      setSelectedIds(new Set());
      await fetchEquipment();
    } catch (error) {
      console.error('Failed to update assets:', error);
      alert('Failed to update some assets.');
    } finally {
      setIsBulkActioning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-zinc-100">Equipment Database</h1>
          <p className="text-zinc-500 mt-1 uppercase font-mono text-sm tracking-widest">
            Manage and track {isLoading ? '...' : equipmentList.length} active assets.
          </p>
        </div>
        
        {selectedIds.size > 0 ? (
          <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 py-2 px-4 rounded-xl">
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-400">
              {selectedIds.size} Selected
            </span>
            <div className="w-px h-6 bg-zinc-700 mx-2"></div>
            <button 
              onClick={handleBulkMarkDown}
              disabled={isBulkActioning}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider text-xs rounded-lg transition-all active:scale-95 flex items-center disabled:opacity-50"
            >
              <Zap className="h-3 w-3 mr-1.5 text-amber-500" />
              Mark Down
            </button>
            <button 
              onClick={handleBulkDelete}
              disabled={isBulkActioning}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold uppercase tracking-wider text-xs rounded-lg transition-all active:scale-95 flex items-center disabled:opacity-50"
            >
              <Trash2 className="h-3 w-3 mr-1.5" />
              Delete
            </button>
            <div className="w-px h-6 bg-zinc-700 mx-1"></div>
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="p-1.5 hover:bg-zinc-700 rounded-lg text-zinc-400 transition-colors"
              title="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider text-sm rounded-xl transition-all active:scale-95 flex items-center border border-zinc-700">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            {hasPermission('add_equipment') && (
              <Link href="/equipment/new" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-sm rounded-xl transition-all active:scale-95 flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Link>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : equipmentList.length === 0 ? (
        <div className="text-center p-12 bg-zinc-800/50 border border-zinc-700 rounded-2xl">
          <p className="text-zinc-500 uppercase tracking-widest font-bold">No equipment found.</p>
          <p className="text-zinc-600 mb-6 text-sm">Add your first asset to start tracking data.</p>
          <Link href="/equipment/new" className="inline-flex px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-sm rounded-xl transition-all active:scale-95 items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center px-2">
            <button 
              onClick={selectAll}
              className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedIds.size === equipmentList.length ? 'bg-amber-500 border-amber-500' : selectedIds.size > 0 ? 'bg-amber-500/20 border-amber-500' : 'border-zinc-600'}`}>
                {selectedIds.size > 0 && <CheckCircle2 className={`w-3 h-3 ${selectedIds.size === equipmentList.length ? 'text-black' : 'text-amber-500'}`} />}
              </div>
              Select All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipmentList.map((eq) => {
              const isSelected = selectedIds.has(eq.id!);
              return (
                <div 
                  key={eq.id} 
                  onClick={() => router.push(`/equipment/${eq.id}`)}
                  className={`cursor-pointer block group bg-zinc-800 border rounded-2xl overflow-hidden transition-colors ${isSelected ? 'border-amber-500 ring-1 ring-amber-500' : 'border-zinc-700 hover:border-zinc-500'}`}
                >
                  <div className="p-5 border-b border-zinc-700 flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div 
                        onClick={(e) => toggleSelection(eq.id!, e)}
                        className={`mt-1 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${isSelected ? 'bg-amber-500 border-amber-500' : 'bg-zinc-900 border-zinc-600 hover:border-amber-400'}`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                            {eq.id ? eq.id.slice(0, 8) : 'NEW'}
                          </span>
                          {eq.status === 'Operational' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                          {eq.status === 'Warning' && <AlertCircle className="h-4 w-4 text-amber-500" />}
                          {eq.status === 'Down' && <Zap className="h-4 w-4 text-red-500" />}
                        </div>
                        <h3 className="text-xl font-bold text-zinc-100 mt-2 group-hover:text-amber-500 transition-colors uppercase tracking-wide">{eq.name}</h3>
                        <p className="text-sm font-bold tracking-widest uppercase text-zinc-500 mt-1">{eq.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full border border-zinc-700 bg-zinc-900 shadow-inner">
                        <span className={`text-sm font-bold font-mono ${
                          (eq.health || 0) > 90 ? 'text-emerald-500' : (eq.health || 0) > 60 ? 'text-amber-500' : 'text-red-500'
                        }`}>{eq.health || 100}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-900/50 p-4 px-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <span>Type: <span className="text-zinc-300">{eq.type}</span></span>
                    <span className="text-amber-500 group-hover:underline">View Details →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
