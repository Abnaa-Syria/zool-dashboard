import { describe, expect, it } from 'vitest';
import { SLUG_RE, validateContent } from './api';

const section = { titleAr: 'مقدمة', titleEn: 'Intro', bodyAr: 'نص', bodyEn: 'Text' };

describe('content pages', () => {
  it('matches the backend slug rule', () => {
    expect(SLUG_RE.test('privacy')).toBe(true);
    expect(SLUG_RE.test('refund-policy2')).toBe(true);
    expect(SLUG_RE.test('a')).toBe(false);
    expect(SLUG_RE.test('2fa')).toBe(false);
    expect(SLUG_RE.test('Terms')).toBe(false);
  });

  it('validates drafts like the PUT schema', () => {
    expect(validateContent({ titleAr: 'الخصوصية', titleEn: 'Privacy', sections: [section] })).toBeNull();
    expect(validateContent({ titleAr: 'خ', titleEn: 'Privacy', sections: [section] })).not.toBeNull();
    expect(validateContent({ titleAr: 'الخصوصية', titleEn: 'Privacy', sections: [] })).not.toBeNull();
    expect(validateContent({ titleAr: 'الخصوصية', titleEn: 'Privacy', sections: [{ ...section, bodyEn: '  ' }] })).not.toBeNull();
  });
});
