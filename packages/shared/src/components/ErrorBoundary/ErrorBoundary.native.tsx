import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme';

type Props = {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onRetry?: () => void;
};

type State = { hasError: boolean };

export class ErrorBoundaryNative extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const title = this.props.fallbackTitle ?? 'Something went wrong';
      const message = this.props.fallbackMessage ?? 'We ran into an error. You can try again.';
      return (
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              this.setState({ hasError: false });
              this.props.onRetry?.();
            }}
          >
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.primaryLight,
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.black, marginBottom: 8, textAlign: 'center' },
  message: { fontSize: 16, color: colors.grey, textAlign: 'center', marginBottom: 24, paddingHorizontal: 16 },
  button: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, backgroundColor: colors.secondary },
  buttonText: { color: colors.white, fontWeight: '600', fontSize: 16 },
});
