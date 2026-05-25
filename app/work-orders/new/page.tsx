'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { equipmentService, Equipment } from '@/lib/services/equipment';
import { workOrdersService } from '@/lib/services/workOrders';

export default function NewWorkOrderPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(true);

  const [formData, setFormData] = useState({
    equipmentId: '',
    issue: '',
    status: 'Open' as const,
    priority: 'Medium' as const,
    assignee: '',
  });

  useEffect(() => {
    async function fetchEquipment() {
      try {
        const data = await equipmentService.getAll();
        setEquipmentList(data);
      } catch (error) {
        console.error('Failed to fetch equipment:', error);
      } finally {
        setIsLoadingEquipment(false);
      }
    }
    fetchEquipment();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.equipmentId) return;

    setIsSubmitting(true);
    try {
      const selectedEquip = equipmentList.find(eq => eq.id === formData.equipmentId);
      
      await workOrdersService.create({
        ...formData,
        equipmentName: selectedEquip ? selectedEquip.name : 'Unknown Equipment'
      });
      router.push('/work-orders');
    } catch (error) {
      console.error('Failed to create work order:', error);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/work-orders" className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors border border-zinc-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-light tracking-tight text-zinc-100">Create Work Order</h1>
          <p className="text-zinc-500 mt-1 uppercase font-mono text-sm tracking-widest">Open a new maintenance request.</p>
        </div>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Equipment <span className="text-red-500">*</span></label>
              {isLoadingEquipment ? (
                <div className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-zinc-500 animate-pulse">Loading equipment...</div>
              ) : (
                <select 
                  name="equipmentId"
                  required
                  value={formData.equipmentId}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 appearance-none"
                >
                  <option value="" disabled>Select Equipment...</option>
                  {equipmentList.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.location})</option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Issue Description <span className="text-red-500">*</span></label>
              <textarea 
                name="issue"
                required
                rows={4}
                value={formData.issue}
                onChange={handleChange}
                placeholder="Describe the issue in detail..." 
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Priority</label>
                <select 
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 appearance-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Assignee</label>
                <select 
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 appearance-none"
                >
                  <option value="">Unassigned</option>
                  <option value="Tech Jones">Tech Jones</option>
                  <option value="Sarah M.">Sarah M.</option>
                  <option value="Mike T.">Mike T.</option>
                  <option value="Alex Chen">Alex Chen</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-700 flex justify-end gap-4">
            <Link href="/work-orders" className="px-6 py-3 bg-transparent hover:bg-zinc-700 text-zinc-300 font-bold uppercase tracking-wider text-sm rounded-xl transition-all">
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting || !formData.equipmentId}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-sm rounded-xl transition-all active:scale-95 flex items-center disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Work Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
