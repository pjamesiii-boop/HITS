'use strict';

/**
 * Renders the homepage header section.
 * @param {Object} options
 * @param {string} options.title - The site title
 * @param {string} options.subtitle - The site subtitle
 * @returns {string} HTML string for the header
 */
function renderHeader({ title = 'HITS', subtitle = 'Welcome to HITS' } = {}) {
  return `<header class="homepage-header">
  <h1 class="homepage-title">${escapeHtml(title)}</h1>
  <p class="homepage-subtitle">${escapeHtml(subtitle)}</p>
</header>`;
}

/**
 * Renders the homepage hero section.
 * @param {Object} options
 * @param {string} options.headline - Hero headline text
 * @param {string} options.ctaText - Call-to-action button text
 * @param {string} options.ctaHref - Call-to-action button href
 * @returns {string} HTML string for the hero
 */
function renderHero({ headline = 'Get Started', ctaText = 'Learn More', ctaHref = '#' } = {}) {
  return `<section class="homepage-hero">
  <h2 class="hero-headline">${escapeHtml(headline)}</h2>
  <a class="hero-cta" href="${escapeHtml(ctaHref)}">${escapeHtml(ctaText)}</a>
</section>`;
}

/**
 * Renders a features grid section.
 * @param {Array<{title: string, description: string}>} features
 * @returns {string} HTML string for the features section
 */
function renderFeatures(features = []) {
  if (!Array.isArray(features) || features.length === 0) {
    return '<section class="homepage-features"></section>';
  }
  const items = features
    .map(
      ({ title = '', description = '' }) =>
        `  <div class="feature-card">
    <h3 class="feature-title">${escapeHtml(title)}</h3>
    <p class="feature-description">${escapeHtml(description)}</p>
  </div>`
    )
    .join('\n');
  return `<section class="homepage-features">
${items}
</section>`;
}

/**
 * Renders the homepage footer.
 * @param {Object} options
 * @param {string} options.copy - Footer copyright text
 * @returns {string} HTML string for the footer
 */
function renderFooter({ copy = `© ${new Date().getFullYear()} HITS. All rights reserved.` } = {}) {
  return `<footer class="homepage-footer">
  <p>${escapeHtml(copy)}</p>
</footer>`;
}

/**
 * Builds the complete homepage HTML.
 * @param {Object} config
 * @param {Object} config.header  - Options passed to renderHeader
 * @param {Object} config.hero    - Options passed to renderHero
 * @param {Array}  config.features - Feature items array
 * @param {Object} config.footer  - Options passed to renderFooter
 * @returns {string} Full HTML document string
 */
function buildHomepage(config = {}) {
  const { header = {}, hero = {}, features = [], footer = {} } = config;

  const headerHtml  = renderHeader(header);
  const heroHtml    = renderHero(hero);
  const featuresHtml = renderFeatures(features);
  const footerHtml  = renderFooter(footer);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(header.title || 'HITS')}</title>
</head>
<body>
${headerHtml}
${heroHtml}
${featuresHtml}
${footerHtml}
</body>
</html>`;
}

/**
 * Escapes special HTML characters to prevent injection.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = { buildHomepage, renderHeader, renderHero, renderFeatures, renderFooter, escapeHtml };
