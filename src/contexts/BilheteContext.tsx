import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { Bilhete, StatusBilhete, FiltrosBilhetes } from '../types';

// Estado do contexto
interface BilheteState {
  bilhetes: Bilhete[];
  filtros: FiltrosBilhetes;
  carregando: boolean;
  erro: string | null;
  total: number;
}

// Ações do contexto
type BilheteAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BILHETES'; payload: Bilhete[] }
  | { type: 'ADD_BILHETES'; payload: Bilhete[] }
  | { type: 'UPDATE_BILHETE'; payload: Bilhete }
  | { type: 'SET_FILTROS'; payload: FiltrosBilhetes }
  | { type: 'SET_TOTAL'; payload: number }
  | { type: 'RESET_STATE' };

// Estado inicial
const initialState: BilheteState = {
  bilhetes: [],
  filtros: {},
  carregando: false,
  erro: null,
  total: 0,
};

// Reducer
function bilheteReducer(state: BilheteState, action: BilheteAction): BilheteState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, carregando: action.payload };
    case 'SET_ERROR':
      return { ...state, erro: action.payload, carregando: false };
    case 'SET_BILHETES':
      return { ...state, bilhetes: action.payload, carregando: false, erro: null };
    case 'ADD_BILHETES':
      return { 
        ...state, 
        bilhetes: [...state.bilhetes, ...action.payload], 
        carregando: false, 
        erro: null 
      };
    case 'UPDATE_BILHETE':
      return {
        ...state,
        bilhetes: state.bilhetes.map(bilhete =>
          bilhete.id === action.payload.id ? action.payload : bilhete
        ),
      };
    case 'SET_FILTROS':
      return { ...state, filtros: action.payload };
    case 'SET_TOTAL':
      return { ...state, total: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

// Interface do contexto
interface BilheteContextType {
  state: BilheteState;
  dispatch: React.Dispatch<BilheteAction>;
  actions: {
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setBilhetes: (bilhetes: Bilhete[]) => void;
    addBilhetes: (bilhetes: Bilhete[]) => void;
    updateBilhete: (bilhete: Bilhete) => void;
    setFiltros: (filtros: FiltrosBilhetes) => void;
    setTotal: (total: number) => void;
    resetState: () => void;
  };
}

// Criação do contexto
const BilheteContext = createContext<BilheteContextType | undefined>(undefined);

// Provider do contexto
interface BilheteProviderProps {
  children: ReactNode;
}

export function BilheteProvider({ children }: BilheteProviderProps) {
  const [state, dispatch] = useReducer(bilheteReducer, initialState);

  const actions = {
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    setBilhetes: (bilhetes: Bilhete[]) => dispatch({ type: 'SET_BILHETES', payload: bilhetes }),
    addBilhetes: (bilhetes: Bilhete[]) => dispatch({ type: 'ADD_BILHETES', payload: bilhetes }),
    updateBilhete: (bilhete: Bilhete) => dispatch({ type: 'UPDATE_BILHETE', payload: bilhete }),
    setFiltros: (filtros: FiltrosBilhetes) => dispatch({ type: 'SET_FILTROS', payload: filtros }),
    setTotal: (total: number) => dispatch({ type: 'SET_TOTAL', payload: total }),
    resetState: () => dispatch({ type: 'RESET_STATE' }),
  };

  return (
    <BilheteContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </BilheteContext.Provider>
  );
}

// Hook para usar o contexto
export function useBilhete() {
  const context = useContext(BilheteContext);
  if (context === undefined) {
    throw new Error('useBilhete deve ser usado dentro de um BilheteProvider');
  }
  return context;
} 