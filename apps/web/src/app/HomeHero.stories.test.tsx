import { render, screen } from '@testing-library/react';
import { TamaguiProvider } from '@tamagui/core';
import config from '../../tamagui.config';
import { Default } from './HomeHero.stories';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <TamaguiProvider config={config}>{children}</TamaguiProvider>;
}

describe('HomeHero', () => {
  it('renders title and subtitle', () => {
    render(<Wrapper>{Default.render()}</Wrapper>);
    expect(screen.getByText('GroupFit')).toBeInTheDocument();
    expect(screen.getByText(/Sign in as admin, trainer, or customer/)).toBeInTheDocument();
  });
});
