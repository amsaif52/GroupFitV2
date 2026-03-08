import type { ChatMessage } from '../../help/types';

export type HelpChatProps = {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  sending: boolean;
  error: string | null;
  hintText: string;
  inputPlaceholder?: string;
};
