'use strict';

const {
  buildHomepage,
  renderHeader,
  renderHero,
  renderFeatures,
  renderFooter,
  escapeHtml,
} = require('./homepage');

describe('escapeHtml', () => {
  test('escapes ampersand', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });
  test('escapes less-than and greater-than', () => {
    expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
  });
  test('escapes double quotes', () => {
    expect(escapeHtml('say "hi"')).toBe('say &quot;hi&quot;');
  });
  test('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#39;s');
  });
  test('returns plain string unchanged', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });
  test('coerces non-string to string', () => {
    expect(escapeHtml(42)).toBe('42');
  });
});

describe('renderHeader', () => {
  test('renders default title and subtitle', () => {
    const html = renderHeader();
    expect(html).toContain('<header class="homepage-header">');
    expect(html).toContain('HITS');
    expect(html).toContain('Welcome to HITS');
  });

  test('renders custom title and subtitle', () => {
    const html = renderHeader({ title: 'My App', subtitle: 'Best App' });
    expect(html).toContain('My App');
    expect(html).toContain('Best App');
  });

  test('escapes HTML in title', () => {
    const html = renderHeader({ title: '<script>alert(1)</script>' });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('renderHero', () => {
  test('renders with defaults', () => {
    const html = renderHero();
    expect(html).toContain('<section class="homepage-hero">');
    expect(html).toContain('Get Started');
    expect(html).toContain('Learn More');
  });

  test('renders custom headline and cta', () => {
    const html = renderHero({ headline: 'Hello', ctaText: 'Click Me', ctaHref: '/start' });
    expect(html).toContain('Hello');
    expect(html).toContain('Click Me');
    expect(html).toContain('/start');
  });

  test('escapes cta href', () => {
    const html = renderHero({ ctaHref: '"javascript:void(0)"' });
    expect(html).toContain('&quot;javascript:void(0)&quot;');
  });
});

describe('renderFeatures', () => {
  test('renders empty section when no features provided', () => {
    const html = renderFeatures();
    expect(html).toBe('<section class="homepage-features"></section>');
  });

  test('renders empty section for empty array', () => {
    const html = renderFeatures([]);
    expect(html).toBe('<section class="homepage-features"></section>');
  });

  test('renders feature cards', () => {
    const features = [
      { title: 'Fast', description: 'Very fast performance.' },
      { title: 'Secure', description: 'Enterprise-grade security.' },
    ];
    const html = renderFeatures(features);
    expect(html).toContain('Fast');
    expect(html).toContain('Very fast performance.');
    expect(html).toContain('Secure');
    expect(html).toContain('Enterprise-grade security.');
    expect(html).toContain('class="feature-card"');
  });

  test('escapes feature content', () => {
    const html = renderFeatures([{ title: '<b>Bold</b>', description: '& more' }]);
    expect(html).toContain('&lt;b&gt;Bold&lt;/b&gt;');
    expect(html).toContain('&amp; more');
  });
});

describe('renderFooter', () => {
  test('renders with default copy', () => {
    const html = renderFooter();
    expect(html).toContain('<footer class="homepage-footer">');
    expect(html).toContain('HITS');
  });

  test('renders custom copy', () => {
    const html = renderFooter({ copy: 'My Company 2024' });
    expect(html).toContain('My Company 2024');
  });
});

describe('buildHomepage', () => {
  test('returns a full HTML document', () => {
    const html = buildHomepage();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('</html>');
    expect(html).toContain('<head>');
    expect(html).toContain('<body>');
  });

  test('includes all sections', () => {
    const html = buildHomepage({
      header: { title: 'HITS App', subtitle: 'Subtitle' },
      hero: { headline: 'Welcome', ctaText: 'Start', ctaHref: '/start' },
      features: [{ title: 'Feature A', description: 'Desc A' }],
      footer: { copy: 'Footer Text' },
    });
    expect(html).toContain('HITS App');
    expect(html).toContain('Subtitle');
    expect(html).toContain('Welcome');
    expect(html).toContain('Start');
    expect(html).toContain('/start');
    expect(html).toContain('Feature A');
    expect(html).toContain('Desc A');
    expect(html).toContain('Footer Text');
  });

  test('sets title tag from header.title', () => {
    const html = buildHomepage({ header: { title: 'Custom Title' } });
    expect(html).toContain('<title>Custom Title</title>');
  });

  test('works with empty config', () => {
    expect(() => buildHomepage({})).not.toThrow();
  });
});
