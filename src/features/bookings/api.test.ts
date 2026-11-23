import { describe, expect, it } from 'vitest';
import { findOtherLeg } from './api';

describe('findOtherLeg', () => {
  const rows = [
    { id: 'a', groupId: 'g1' },
    { id: 'b', groupId: 'g1' },
    { id: 'c', groupId: 'g2' },
    { id: 'd', groupId: null },
  ];
  it('returns the other booking of the same round-trip group', () => {
    expect(findOtherLeg({ id: 'a', groupId: 'g1' }, rows)?.id).toBe('b');
    expect(findOtherLeg({ id: 'b', groupId: 'g1' }, rows)?.id).toBe('a');
  });
  it('returns null without a group or a sibling', () => {
    expect(findOtherLeg({ id: 'd', groupId: null }, rows)).toBeNull();
    expect(findOtherLeg({ id: 'c', groupId: 'g2' }, rows)).toBeNull();
  });
});
