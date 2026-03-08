export interface LoginFormProps {
  onSubmit: (email: string, password: string) => void | Promise<void>;
  loading?: boolean;
  error?: string;
}
