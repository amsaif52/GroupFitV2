import Link from 'next/link';
import { Button, H1, Paragraph, YStack } from 'tamagui';
import { ROLES } from '@groupfit/shared';

export default function HomePage() {
  return (
    <main>
      <YStack padding="$4" maxWidth={600} margin="0 auto" gap="$3">
        <H1 size="$8">GroupFit</H1>
        <Paragraph theme="alt2" size="$4">Sign in as:</Paragraph>
        <YStack flexDirection="row" flexWrap="wrap" gap="$2">
          <Link href="/login?role=admin">
            <Button theme="blue" size="$3">{ROLES.ADMIN}</Button>
          </Link>
          <Link href="/login?role=trainer">
            <Button theme="green" size="$3">{ROLES.TRAINER}</Button>
          </Link>
          <Link href="/login?role=customer">
            <Button theme="orange" size="$3">{ROLES.CUSTOMER}</Button>
          </Link>
        </YStack>
      </YStack>
    </main>
  );
}
