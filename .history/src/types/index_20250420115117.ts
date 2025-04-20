export type RootStackParamList = {
  Voice: undefined;
  Text: {
    initialText?: string;
  };
  Settings: undefined;
  HistoryRecord: undefined;
  PromptEditor?: undefined;
  TargetSystemSettings?: undefined;
};

export type Theme = {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    secondaryText: string;
    border: string;
    inputBackground: string;
    error: string;
  };
};

export type InteractionMode = 'voice' | 'text';

export type Message = {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: number;
  status: 'sending' | 'sent' | 'error';
};

export type TargetSystem = 'calendar' | 'reminder' | 'note' | 'none';

export type OperationStatus = 'success' | 'failure' | 'pending';

export type HistoryRecord = {
  id: string;
  originalText: string;
  processedText?: string;
  targetSystem: TargetSystem;
  operation: string;
  status: OperationStatus;
  timestamp: number;
  error?: string;
  metadata?: Record<string, any>;
}; 