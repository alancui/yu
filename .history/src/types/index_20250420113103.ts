export type RootStackParamList = {
  Voice: undefined;
  Text: undefined;
  Settings: undefined;
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