import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  type ImageSourcePropType,
  StyleSheet,
} from 'react-native';
import { colors, fontSizes } from '../../theme';

export interface SplashScreenNativeProps {
  title?: string;
  version?: string;
  subtitle?: string;
  loading?: boolean;
  /** Optional logo image source (require() or { uri }) */
  logoSource?: ImageSourcePropType;
  /** Background color */
  backgroundColor?: string;
}

export function SplashScreenNative({
  title = 'GroupFit',
  version,
  subtitle,
  loading = false,
  logoSource,
  backgroundColor = colors.primaryLight,
}: SplashScreenNativeProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.inner}>
        {logoSource != null ? (
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        ) : (
          <Text style={styles.title}>{title}</Text>
        )}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {version ? <Text style={styles.version}>v{version}</Text> : null}
        {loading ? (
          <ActivityIndicator size="large" color={colors.secondary} style={styles.spinner} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 172,
    height: 156,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.black,
  },
  subtitle: {
    fontSize: fontSizes.font16,
    color: colors.grey,
    marginTop: 8,
  },
  version: {
    fontSize: fontSizes.font14,
    color: colors.grey,
    marginTop: 6,
    opacity: 0.8,
  },
  spinner: {
    marginTop: 24,
  },
});
