import { db } from '@/lib/firebase';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';

export interface WorkOrderNote {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface WorkOrder {
  id?: string;
  displayId?: string; // e.g. WO-2941
  equipmentId: string;
  equipmentName?: string; // denormalized for easy display
  issue: string;
  status: 'Open' | 'In Progress' | 'Review' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  assignee: string; // user name or ID
  comments?: number;
  photos?: string[];
  notes?: WorkOrderNote[];
  createdAt?: any;
  updatedAt?: any;
}

const COLLECTION_NAME = 'workOrders';

export const workOrdersService = {
  async getAll(): Promise<WorkOrder[]> {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkOrder));
  },

  async getByEquipmentId(equipmentId: string): Promise<WorkOrder[]> {
    const q = query(collection(db, COLLECTION_NAME), where('equipmentId', '==', equipmentId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkOrder));
  },

  async getById(id: string): Promise<WorkOrder | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as WorkOrder;
    }
    return null;
  },

  async create(data: Omit<WorkOrder, 'id' | 'displayId' | 'createdAt' | 'updatedAt' | 'comments'>): Promise<string> {
    // Generate a random display ID like WO-XXXX
    const randomDisplayId = `WO-${Math.floor(1000 + Math.random() * 9000)}`;

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      displayId: randomDisplayId,
      comments: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<WorkOrder>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async addPhoto(id: string, photoUrl: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;
    const current = docSnap.data().photos || [];
    await updateDoc(docRef, {
      photos: [...current, photoUrl],
      updatedAt: serverTimestamp(),
    });
  },

  async addNote(id: string, note: Omit<WorkOrderNote, 'id' | 'createdAt'>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;
    const currentNotes = docSnap.data().notes || [];
    
    // Generate simple unique ID
    const noteId = Math.random().toString(36).substring(2, 9);
    
    const newNote: WorkOrderNote = {
      ...note,
      id: noteId,
      createdAt: new Date().toISOString(),
    };
    
    await updateDoc(docRef, {
      notes: [...currentNotes, newNote],
      updatedAt: serverTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
