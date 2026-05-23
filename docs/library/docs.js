/**
 * HITS Documentation Library — client-side routing, search, navigation.
 * Zero dependencies. Matches harpyits.com theme.
 */
(function() {
  'use strict';

  var state = {
    product: null,
    manifest: null,
    slug: null,
    searchIndex: null,
    allManifests: {}
  };

  // --- Initialization ---

  document.addEventListener('DOMContentLoaded', function() {
    loadSearchIndex();
    loadProductList();

    var path = window.location.hash.replace(/^#\/?/, '');
    var parts = path.split('/');
    var product = parts[0] || 'raptor';
    var slug = parts.slice(1).join('-') || null;

    switchProduct(product).then(function() {
      if (slug) navigateTo(product, slug);
    });

    // Search
    var searchInput = document.getElementById('docs-search-input');
    var debounce = null;
    searchInput.addEventListener('input', function() {
      clearTimeout(debounce);
      debounce = setTimeout(function() { handleSearch(searchInput.value); }, 200);
    });
    searchInput.addEventListener('focus', function() {
      if (searchInput.value.length >= 2) handleSearch(searchInput.value);
    });
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.docs-search')) closeSearch();
    });

    // Hamburger
    var hamburger = document.getElementById('docs-hamburger');
    if (hamburger) {
      hamburger.addEventListener('click', function() {
        document.getElementById('docs-sidebar').classList.toggle('open');
      });
    }
  });

  window.addEventListener('popstate', function(e) {
    if (e.state && e.state.product && e.state.slug) {
      if (e.state.product !== state.product) {
        switchProduct(e.state.product).then(function() {
          navigateTo(e.state.product, e.state.slug);
        });
      } else {
        navigateTo(e.state.product, e.state.slug);
      }
    }
  });

  // --- Product list ---

  function loadProductList() {
    var select = document.getElementById('docs-product-select');
    fetch('search-index.json').then(function(r) { return r.json(); }).then(function(data) {
      var products = {};
      data.forEach(function(e) { products[e.product] = true; });
      Object.keys(products).forEach(function(p) {
        var opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p.charAt(0).toUpperCase() + p.slice(1);
        select.appendChild(opt);
      });
    });
    select.addEventListener('change', function() {
      switchProduct(select.value);
    });
  }

  // --- Product switching ---

  function switchProduct(productId) {
    state.product = productId;
    var select = document.getElementById('docs-product-select');
    select.value = productId;

    return fetch(productId + '/manifest.json')
      .then(function(r) { return r.json(); })
      .then(function(manifest) {
        state.manifest = manifest;
        state.allManifests[productId] = manifest;
        renderSidebar(manifest);
        if (!state.slug && manifest.groups.length > 0 && manifest.groups[0].pages.length > 0) {
          return navigateTo(productId, manifest.groups[0].pages[0].slug);
        }
      });
  }

  // --- Sidebar ---

  function renderSidebar(manifest) {
    var nav = document.getElementById('docs-nav');
    nav.innerHTML = '';
    manifest.groups.forEach(function(group) {
      var groupEl = document.createElement('div');
      groupEl.className = 'docs-nav-group';
      var title = document.createElement('div');
      title.className = 'docs-nav-group-title';
      title.textContent = group.name;
      groupEl.appendChild(title);

      group.pages.forEach(function(page) {
        var link = document.createElement('a');
        link.className = 'docs-nav-link';
        link.href = '#/' + state.product + '/' + page.slug.replace(/-/g, '/');
        link.textContent = page.title;
        link.dataset.slug = page.slug;
        link.addEventListener('click', function(e) {
          e.preventDefault();
          navigateTo(state.product, page.slug);
          // Close mobile sidebar
          document.getElementById('docs-sidebar').classList.remove('open');
        });
        groupEl.appendChild(link);
      });

      nav.appendChild(groupEl);
    });
  }

  function updateActivePage(slug) {
    var links = document.querySelectorAll('.docs-nav-link');
    links.forEach(function(link) {
      link.classList.toggle('active', link.dataset.slug === slug);
    });
  }

  // --- Page navigation ---

  function navigateTo(product, slug) {
    state.slug = slug;
    return fetch(product + '/pages/' + slug + '.html')
      .then(function(r) {
        if (!r.ok) throw new Error('Page not found');
        return r.text();
      })
      .then(function(html) {
        document.getElementById('docs-content').innerHTML = html;
        history.pushState({ product: product, slug: slug }, '', '#/' + product + '/' + slug.replace(/-/g, '/'));
        updateActivePage(slug);
        document.getElementById('docs-content').scrollTop = 0;
        window.scrollTo(0, 0);
        renderPager(product, slug);
      })
      .catch(function() {
        document.getElementById('docs-content').innerHTML = '<div class="docs-page"><h1>Page not found</h1><p>The requested page does not exist.</p></div>';
      });
  }

  // --- Pager (prev/next) ---

  function renderPager(product, currentSlug) {
    var manifest = state.allManifests[product];
    if (!manifest) return;

    var allPages = [];
    manifest.groups.forEach(function(g) {
      g.pages.forEach(function(p) { allPages.push(p); });
    });

    var idx = -1;
    for (var i = 0; i < allPages.length; i++) {
      if (allPages[i].slug === currentSlug) { idx = i; break; }
    }

    var pager = document.createElement('div');
    pager.className = 'docs-pager';

    if (idx > 0) {
      var prev = allPages[idx - 1];
      var prevLink = document.createElement('a');
      prevLink.href = '#';
      prevLink.innerHTML = '<span class="docs-pager-label">\u2190 Previous</span>' + prev.title;
      prevLink.addEventListener('click', function(e) { e.preventDefault(); navigateTo(product, prev.slug); });
      pager.appendChild(prevLink);
    } else {
      pager.appendChild(document.createElement('span'));
    }

    if (idx < allPages.length - 1) {
      var next = allPages[idx + 1];
      var nextLink = document.createElement('a');
      nextLink.href = '#';
      nextLink.style.textAlign = 'right';
      nextLink.innerHTML = '<span class="docs-pager-label">Next \u2192</span>' + next.title;
      nextLink.addEventListener('click', function(e) { e.preventDefault(); navigateTo(product, next.slug); });
      pager.appendChild(nextLink);
    }

    var content = document.getElementById('docs-content');
    var existing = content.querySelector('.docs-pager');
    if (existing) existing.remove();
    content.appendChild(pager);
  }

  // --- Search ---

  function loadSearchIndex() {
    fetch('search-index.json')
      .then(function(r) { return r.json(); })
      .then(function(data) { state.searchIndex = data; });
  }

  function handleSearch(query) {
    var results = search(query);
    var container = document.getElementById('docs-search-results');
    if (results.length === 0) {
      container.classList.remove('open');
      container.innerHTML = '';
      return;
    }

    container.innerHTML = '';
    results.forEach(function(result) {
      var div = document.createElement('div');
      div.className = 'docs-search-result';
      div.innerHTML = '<div class="docs-search-result-title">' +
        result.title +
        '<span class="product-badge">' + result.product + '</span>' +
        '</div>' +
        '<div class="docs-search-result-desc">' + (result.snippet || result.description) + '</div>';
      div.addEventListener('click', function() {
        closeSearch();
        document.getElementById('docs-search-input').value = '';
        if (result.product !== state.product) {
          switchProduct(result.product).then(function() {
            navigateTo(result.product, result.slug);
          });
        } else {
          navigateTo(result.product, result.slug);
        }
      });
      container.appendChild(div);
    });
    container.classList.add('open');
  }

  function search(query) {
    if (!state.searchIndex || query.length < 2) return [];
    var lower = query.toLowerCase();
    return state.searchIndex
      .filter(function(entry) {
        return entry.title.toLowerCase().indexOf(lower) >= 0 ||
          entry.description.toLowerCase().indexOf(lower) >= 0 ||
          entry.content.toLowerCase().indexOf(lower) >= 0;
      })
      .slice(0, 20)
      .map(function(entry) {
        return {
          product: entry.product,
          slug: entry.slug,
          title: entry.title,
          description: entry.description,
          snippet: extractSnippet(entry.content, lower)
        };
      });
  }

  function extractSnippet(content, query) {
    var idx = content.toLowerCase().indexOf(query);
    if (idx < 0) return content.substring(0, 120) + '...';
    var start = Math.max(0, idx - 40);
    var end = Math.min(content.length, idx + query.length + 80);
    var snippet = (start > 0 ? '...' : '') + content.substring(start, end) + (end < content.length ? '...' : '');
    return snippet;
  }

  function closeSearch() {
    document.getElementById('docs-search-results').classList.remove('open');
  }

})();
