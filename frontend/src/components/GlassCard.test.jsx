import { render, screen, fireEvent } from '@testing-library/react';
import GlassCard from './GlassCard';

describe('GlassCard', () => {
  test('should render children', () => {
    render(
      <GlassCard>
        <p>Card Content</p>
      </GlassCard>
    );
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  test('should apply default glass-card classes', () => {
    render(<GlassCard><span>Content</span></GlassCard>);
    const card = screen.getByText('Content').parentElement;
    expect(card.className).toContain('glass-card');
    expect(card.className).toContain('rounded-2xl');
    expect(card.className).toContain('p-6');
  });

  test('should merge custom className with default classes', () => {
    render(
      <GlassCard className="custom-class">
        <span>Content</span>
      </GlassCard>
    );
    const card = screen.getByText('Content').parentElement;
    expect(card.className).toContain('glass-card');
    expect(card.className).toContain('custom-class');
  });

  test('should add cursor-pointer when onClick is provided', () => {
    const handleClick = vi.fn();
    render(
      <GlassCard onClick={handleClick}>
        <span>Clickable Card</span>
      </GlassCard>
    );
    const card = screen.getByText('Clickable Card').parentElement;
    expect(card.className).toContain('cursor-pointer');
    expect(card.className).toContain('hover:scale-[1.01]');
  });

  test('should not add cursor-pointer when onClick is not provided', () => {
    render(
      <GlassCard>
        <span>Non-clickable Card</span>
      </GlassCard>
    );
    const card = screen.getByText('Non-clickable Card').parentElement;
    expect(card.className).not.toContain('cursor-pointer');
    expect(card.className).not.toContain('hover:scale-[1.01]');
  });

  test('should call onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(
      <GlassCard onClick={handleClick}>
        <span>Clickable</span>
      </GlassCard>
    );
    fireEvent.click(screen.getByText('Clickable'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
