import { db } from '@/lib/firebase';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

export interface StatusHistoryEntry {
  status: 'Operational' | 'Warning' | 'Down';
  reason?: string;
  author: string;
  timestamp: string;
}

export interface Equipment {
  id?: string;
  name: string;
  type: string;
  location: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  installDate?: string;
  tags?: string[];
  status: 'Operational' | 'Warning' | 'Down';
  health?: number;
  lastPmDate?: string;
  statusHistory?: StatusHistoryEntry[];
  createdAt?: any;
  updatedAt?: any;
}

const COLLECTION_NAME = 'equipment';

export const equipmentService = {
  async getAll(): Promise<Equipment[]> {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Equipment));
  },

  async getById(id: string): Promise<Equipment | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Equipment;
    }
    return null;
  },

  async create(data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<Equipment>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async updateStatus(id: string, status: 'Operational' | 'Warning' | 'Down', reason: string, author: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;
    
    const equipment = docSnap.data() as Equipment;
    const currentHistory = equipment.statusHistory || [];
    
    const newEntry: StatusHistoryEntry = {
      status,
      reason,
      author,
      timestamp: new Date().toISOString(),
    };
    
    await updateDoc(docRef, {
      status,
      statusHistory: [newEntry, ...currentHistory],
      updatedAt: serverTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
