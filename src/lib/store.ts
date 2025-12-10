import { create } from 'zustand';
import type { SmartLink, AgentLog, SideShiftShift, ToastMessage, SmartAccountInfo } from './types';
import { generateId } from './utils';

interface AppState {
  // Smart Account
  smartAccount: SmartAccountInfo | null;
  setSmartAccount: (account: SmartAccountInfo | null) => void;
  
  // Smart Links
  smartLinks: SmartLink[];
  addSmartLink: (link: SmartLink) => void;
  updateSmartLink: (id: string, updates: Partial<SmartLink>) => void;
  removeSmartLink: (id: string) => void;
  
  // Active Shifts
  activeShifts: SideShiftShift[];
  setActiveShifts: (shifts: SideShiftShift[]) => void;
  updateShift: (id: string, shift: SideShiftShift) => void;
  
  // Agent Logs
  agentLogs: AgentLog[];
  addAgentLog: (log: Omit<AgentLog, 'id' | 'timestamp'>) => void;
  clearAgentLogs: () => void;
  
  // Toast Messages
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  
  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  selectedLinkId: string | null;
  setSelectedLinkId: (id: string | null) => void;
  
  // Modal State
  modalOpen: string | null;
  setModalOpen: (modal: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  // Smart Account
  smartAccount: null,
  setSmartAccount: (account) => set({ smartAccount: account }),
  
  // Smart Links
  smartLinks: [],
  addSmartLink: (link) =>
    set((state) => ({ smartLinks: [link, ...state.smartLinks] })),
  updateSmartLink: (id, updates) =>
    set((state) => ({
      smartLinks: state.smartLinks.map((link) =>
        link.id === id ? { ...link, ...updates } : link
      ),
    })),
  removeSmartLink: (id) =>
    set((state) => ({
      smartLinks: state.smartLinks.filter((link) => link.id !== id),
    })),
  
  // Active Shifts
  activeShifts: [],
  setActiveShifts: (shifts) => set({ activeShifts: shifts }),
  updateShift: (id, shift) =>
    set((state) => ({
      activeShifts: state.activeShifts.map((s) =>
        s.id === id ? shift : s
      ),
    })),
  
  // Agent Logs
  agentLogs: [],
  addAgentLog: (log) =>
    set((state) => ({
      agentLogs: [
        {
          ...log,
          id: generateId(),
          timestamp: new Date().toISOString(),
        },
        ...state.agentLogs,
      ].slice(0, 100), // Keep only last 100 logs
    })),
  clearAgentLogs: () => set({ agentLogs: [] }),
  
  // Toast Messages
  toasts: [],
  addToast: (toast) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    // Auto-remove after 5 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 5000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  
  // UI State
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  selectedLinkId: null,
  setSelectedLinkId: (id) => set({ selectedLinkId: id }),
  
  // Modal State
  modalOpen: null,
  setModalOpen: (modal) => set({ modalOpen: modal }),
}));

// Persistence middleware for localStorage
if (typeof window !== 'undefined') {
  // Load smart links from localStorage on init
  const storedLinks = localStorage.getItem('shiftstream_smart_links');
  if (storedLinks) {
    try {
      const links = JSON.parse(storedLinks);
      useStore.setState({ smartLinks: links });
    } catch {
      console.warn('Failed to parse stored smart links');
    }
  }

  // Subscribe to changes and persist
  useStore.subscribe((state) => {
    localStorage.setItem('shiftstream_smart_links', JSON.stringify(state.smartLinks));
  });
}
