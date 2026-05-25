'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { equipmentService, Equipment } from '@/lib/services/equipment';

export default function EditEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<{
    name: string;
    type: string;
    location: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    status: 'Operational' | 'Warning' | 'Down';
    health: number;
    tags: string;
  }>({
    name: '',
    type: '',
    location: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    status: 'Operational',
    health: 100,
    tags: '',
  });

  useEffect(() => {
    async function fetchEquipment() {
      try {
        const data = await equipmentService.getById(resolvedParams.id);
        if (data) {
          setFormData({
            name: data.name || '',
            type: data.type || '',
            location: data.location || '',
            manufacturer: data.manufacturer || '',
            model: data.model || '',
            serialNumber: data.serialNumber || '',
            status: data.status || 'Operational',
            health: data.health || 100,
            tags: data.tags ? data.tags.join(', ') : '',
          });
        } else {
          router.push('/equipment');
        }
      } catch (error) {
        console.error('Failed to fetch equipment:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEquipment();
  }, [resolvedParams.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
      
      const payload = {
        ...formData,
        tags
      };
      
      await equipmentService.update(resolvedParams.id, payload);
      router.push(`/equipment/${resolvedParams.id}`);
    } catch (error) {
      console.error('Failed to update equipment:', error);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'health' ? parseInt(value) : value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href={`/equipment/${resolvedParams.id}`} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors border border-zinc-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-light tracking-tight text-zinc-100">Edit Equipment</h1>
          <p className="text-zinc-500 mt-1 uppercase font-mono text-sm tracking-widest">ID: {resolvedParams.id}</p>
        </div>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Equipment Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Equipment Type <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Location / Area <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Status</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 appearance-none"
              >
                <option value="Operational">Operational</option>
                <option value="Warning">Warning</option>
                <option value="Down">Down</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Manufacturer</label>
              <input 
                type="text" 
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Model</label>
              <input 
                type="text" 
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Serial Number</label>
              <input 
                type="text" 
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Maintenance Tags</label>
              <input 
                type="text" 
                name="tags"
                placeholder="HVAC, Filter, Electrical (comma-separated)"
                value={formData.tags}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-700 flex justify-end gap-4">
            <Link href={`/equipment/${resolvedParams.id}`} className="px-6 py-3 bg-transparent hover:bg-zinc-700 text-zinc-300 font-bold uppercase tracking-wider text-sm rounded-xl transition-all">
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-sm rounded-xl transition-all active:scale-95 flex items-center disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
