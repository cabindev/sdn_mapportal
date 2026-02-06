// store/gis_mapStore.ts
import { create } from 'zustand'
import { Document } from '@prisma/client'

interface MapState {
  selectedDocument: Document | null;
  documents: Document[];
  setSelectedDocument: (doc: Document | null) => void;
  setDocuments: (docs: Document[]) => void;
}

export const useMapStore = create<MapState>((set) => ({
  selectedDocument: null,
  documents: [],
  setSelectedDocument: (doc) => set({ selectedDocument: doc }),
  setDocuments: (docs) => set({ documents: docs })
}))