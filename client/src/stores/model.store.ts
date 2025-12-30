import { create } from 'zustand';

export interface ModelOption {
  id: string;
  name: string;
}

export const MODELS: ModelOption[] = [
  { id: 'xiaomi/mimo-v2-flash:free', name: 'Mimo V2 Flash' },
  { id: 'mistralai/devstral-2512:free', name: 'Devstral 2512' },
  { id: 'kwaipilot/kat-coder-pro:free', name: 'Kat Coder Pro' },
  { id: 'tngtech/deepseek-r1t2-chimera:free', name: 'DeepSeek R1T2 Chimera' },
  { id: 'nex-agi/deepseek-v3.1-nex-n1:free', name: 'DeepSeek V3.1 Nex N1' },
];

interface ModelStore {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

export const useModelStore = create<ModelStore>((set) => ({
  selectedModel: 'xiaomi/mimo-v2-flash:free',
  setSelectedModel: (model) => set({ selectedModel: model }),
}));
