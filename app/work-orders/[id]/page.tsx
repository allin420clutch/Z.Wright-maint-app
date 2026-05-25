'use client';

import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Camera, UploadCloud, FileImage, Settings, QrCode, ScanLine, AlertCircle, X, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { workOrdersService, WorkOrder } from '@/lib/services/workOrders';
import Image from 'next/image';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { equipmentService, Equipment } from '@/lib/services/equipment';

export default function WorkOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { hasPermission, currentUser } = useAuth();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchWorkOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  async function fetchWorkOrder() {
    try {
      const data = await workOrdersService.getById(resolvedParams.id);
      setWorkOrder(data);
    } catch (error) {
      console.error('Failed to fetch work order:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this work order?')) {
      try {
        await workOrdersService.delete(resolvedParams.id);
        router.push('/work-orders');
      } catch (error) {
        console.error('Failed to delete work order:', error);
      }
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !currentUser) return;
    setIsAddingNote(true);
    try {
      await workOrdersService.addNote(resolvedParams.id, {
        text: newNote.trim(),
        author: currentUser.name,
      });
      setNewNote('');
      await fetchWorkOrder();
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const result = detectedCodes[0].rawValue;
      let equipmentId = result;
      // Extract ID if it's a relative equipment path
      if (result.startsWith('/equipment/')) {
        equipmentId = result.replace('/equipment/', '');
      }

      setIsScanning(false);
      try {
        // Fetch equipment to get the name
        const equipment = await equipmentService.getById(equipmentId);
        if (equipment) {
          await workOrdersService.update(resolvedParams.id, {
            equipmentId: equipment.id,
            equipmentName: equipment.name,
          });
          await fetchWorkOrder();
          alert('Asset linked successfully!');
        } else {
          alert('Equipment not found.');
        }
      } catch (error) {
        console.error('Failed to link equipment:', error);
        alert('Failed to link equipment.');
      }
    }
  };

  const handleScanError = (error: unknown) => {
    console.error('QR Scanner error:', error);
    if (error instanceof Error && error.name !== 'NotFoundException') {
      setScanError(error.message);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      if (navigator.onLine) {
        // Online: Use API to upload photo to server
        const formData = new FormData();
        formData.append('photo', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (data.url) {
          await workOrdersService.addPhoto(resolvedParams.id, data.url);
          await fetchWorkOrder();
        } else {
          console.error('Failed upload:', data.error);
        }
      } else {
        // Offline: Convert to Base64 and insert directly to Firestore
        // Firestore persistent cache will sync it to the cloud when online
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          await workOrdersService.addPhoto(resolvedParams.id, base64String);
          await fetchWorkOrder();
        };
        reader.readAsDataURL(file);
      }
    } catch(err) {
      console.error('Error uploading file:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="text-center p-12">
        <h2 className="text-2xl font-bold text-white mb-2">Work Order Not Found</h2>
        <Link href="/work-orders" className="text-amber-500 hover:underline">Return to Work Orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/work-orders" className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors border border-zinc-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest border mb-1 ${
              workOrder.priority === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
              workOrder.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
              'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            }`}>
              {workOrder.priority} Priority
            </span>
            <h1 className="text-4xl font-light tracking-tight text-white uppercase">{workOrder.displayId || 'WO Details'}</h1>
            <p className="text-zinc-500 mt-1 uppercase font-mono text-sm tracking-widest">
              Equipment: <Link href={`/equipment/${workOrder.equipmentId}`} className="text-amber-500 hover:underline">{workOrder.equipmentName}</Link>
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
           {hasPermission('delete_work_order') && (
             <button onClick={handleDelete} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-all active:scale-95" title="Delete Work Order">
               <Trash2 className="h-5 w-5" />
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-zinc-800 rounded-2xl border border-zinc-700 p-6 flex flex-col h-full"> 
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Issue Description
            </h2>
            <div className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl p-4">
              <p className="text-zinc-300 font-mono text-sm whitespace-pre-wrap">{workOrder.issue}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Status</p>
                <p className="text-lg font-medium text-white mt-1 uppercase tracking-wide">{workOrder.status}</p>
              </div>
              <div className="ml-8">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Assignee</p>
                <p className="text-lg font-medium text-white mt-1 uppercase tracking-wide">{workOrder.assignee || 'Unassigned'}</p>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-zinc-800 rounded-2xl border border-zinc-700 p-6 flex flex-col">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Notes ({workOrder.notes?.length || 0})
            </h2>

            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
              {workOrder.notes && workOrder.notes.length > 0 ? (
                workOrder.notes.map((note) => (
                  <div key={note.id} className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-amber-500 text-sm">{note.author}</span>
                      <span className="text-xs text-zinc-500 font-mono">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-zinc-300 text-sm whitespace-pre-wrap">{note.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-zinc-500 text-sm border border-dashed border-zinc-700 rounded-xl">
                  No notes yet. Be the first to add one!
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-auto pt-4 border-t border-zinc-700">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 resize-none h-[80px]"
              />
              <button
                onClick={handleAddNote}
                disabled={isAddingNote || !newNote.trim()}
                className="px-6 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold uppercase tracking-widest text-sm rounded-xl transition-all h-[80px]"
              >
                {isAddingNote ? 'Adding...' : 'Add Note'}
              </button>
            </div>
          </div>
        </div>

        {/* Action Panel for Photos */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
           <input 
             type="file" 
             accept="image/*" 
             className="hidden" 
             ref={fileInputRef} 
             onChange={handleFileChange}
           />
           <button 
             onClick={() => setIsScanning(true)}
             className="flex-1 min-h-[50px] bg-indigo-500/10 border border-indigo-500/50 hover:bg-indigo-500/20 text-indigo-400 font-bold uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all w-full"
           >
             <QrCode className="w-5 h-5" />
             Link Asset via QR
           </button>
           <button 
            onClick={triggerFileUpload}
            disabled={isUploading}
            className="flex-1 min-h-[60px] bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
             <Camera className="w-5 h-5" />
             {isUploading ? 'Uploading...' : 'Add Photo'}
          </button>
          
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 flex flex-col flex-1">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <FileImage className="w-4 h-4" /> Attached Photos
            </h3>
            
            <div className="space-y-4">
              {workOrder.photos && workOrder.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {workOrder.photos.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-700 bg-black">
                      <Image 
                        src={url} 
                        alt="Work Order Photo" 
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-zinc-900 border border-zinc-700 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center">
                   <UploadCloud className="w-8 h-8 text-zinc-600 mb-2" />
                   <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">No Photos</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isScanning && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-700 flex justify-between items-center bg-zinc-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <QrCode className="h-5 w-5 text-amber-500" />
                Scan Asset Tag
              </h3>
              <button 
                onClick={() => setIsScanning(false)}
                className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-zinc-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="relative aspect-square bg-black">
              {scanError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-zinc-900/90 z-20 text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Scanner Error</h2>
                  <p className="text-zinc-400 mb-6">{scanError}</p>
                  <button 
                    onClick={() => setScanError(null)}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-sm rounded-xl transition-all"
                  >
                    Try Again
                  </button>
                </div>
              ) : null}

              <Scanner
                onScan={handleScan}
                onError={handleScanError}
                scanDelay={1000}
              />
              
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur rounded-full border border-white/10 z-10 whitespace-nowrap">
                <span className="text-[10px] font-bold tracking-widest uppercase text-white flex items-center gap-2">
                  <ScanLine className="h-4 w-4 text-amber-500" />
                  Align QR code within frame
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

