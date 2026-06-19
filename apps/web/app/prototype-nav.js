/**
 * Neural AI - Prototype Navigation
 * Injects a floating navigation bar into all prototype HTML pages.
 * Include this script at the bottom of each HTML file:
 *   <script src="/apps/web/app/prototype-nav.js"></script>
 *
 * Or it can be auto-injected by the inject-nav.sh script.
 */
(function() {
    // Determine relative path to prototype-index.html
    const path = window.location.pathname;
    const appBase = path.substring(0, path.indexOf('/apps/web/app/') + '/apps/web/app/'.length);

    // Compute relative prefix from current page to apps/web/app/
    const currentDir = path.substring(0, path.lastIndexOf('/') + 1);
    const appDir = appBase;
    let rel = '';
    if (currentDir.startsWith(appDir)) {
        const depth = currentDir.substring(appDir.length).split('/').filter(Boolean).length;
        rel = depth > 0 ? '../'.repeat(depth) : './';
    } else {
        rel = appBase;
    }

    const sections = [
        {
            label: 'Landing',
            items: [
                { name: 'Homepage', href: rel + 'landing/preview.html' },
                { name: 'Pricing', href: rel + 'landing/pricing/preview.html' },
                { name: 'Solutions', href: rel + 'landing/solutions/preview.html' },
                { name: 'Use Cases', href: rel + 'landing/use-cases/preview.html' },
                { name: 'Resources', href: rel + 'landing/resources/preview.html' },
                { name: 'FAQ', href: rel + 'landing/faq/preview.html' },
                { name: 'Partners', href: rel + 'landing/partners/preview.html' },
            ]
        },
        {
            label: 'Prospecting',
            items: [
                { name: 'Dashboard', href: rel + '(dashboard)/prospects/preview.html' },
                { name: 'Advanced', href: rel + '(dashboard)/prospects/advanced/preview.html' },
                { name: 'Discovery', href: rel + '(dashboard)/prospects/discovery/preview.html' },
            ]
        },
        {
            label: 'Enrichment',
            items: [
                { name: 'Dashboard', href: rel + '(dashboard)/enrichment/preview.html' },
                { name: 'Results', href: rel + '(dashboard)/enrichment/results/preview.html' },
                { name: 'Match Rate', href: rel + '(dashboard)/enrichment/match-rate/preview.html' },
                { name: 'Bulk Upload', href: rel + '(dashboard)/enrichment/bulk-upload/preview.html' },
            ]
        },
        {
            label: 'Campaigns',
            items: [
                { name: 'Dashboard', href: rel + '(dashboard)/campaigns/preview.html' },
                { name: 'Builder', href: rel + '(dashboard)/campaigns/builder/preview.html' },
                { name: 'Personalize', href: rel + '(dashboard)/campaigns/personalization/preview.html' },
                { name: 'Add to Campaign', href: rel + '(dashboard)/campaigns/add-to-campaign.html' },
                { name: 'Review & Launch', href: rel + '(dashboard)/campaigns/review-launch/preview.html' },
                { name: 'Sequences', href: rel + '(dashboard)/sequences/preview.html' },
            ]
        },
        {
            label: 'Dialer',
            items: [
                { name: 'Power Dialer', href: rel + '(dashboard)/dialer/preview.html' },
                { name: 'Live Call', href: rel + '(dashboard)/dialer/live/preview.html' },
            ]
        },
        {
            label: 'Intelligence',
            items: [
                { name: 'Sales Intel', href: rel + '(dashboard)/intelligence/preview.html' },
                { name: 'Deal Deep Dive', href: rel + '(dashboard)/intelligence/deal-deep-dive/preview.html' },
                { name: 'Deal Monitor', href: rel + '(dashboard)/intelligence/deal-monitor/preview.html' },
                { name: 'Deal Risk', href: rel + '(dashboard)/intelligence/deal-risk/preview.html' },
                { name: 'Risk Detail', href: rel + '(dashboard)/intelligence/risk-detail/preview.html' },
                { name: 'Next Action', href: rel + '(dashboard)/intelligence/next-best-action/preview.html' },
            ]
        },
        {
            label: 'Settings',
            items: [
                { name: 'Security', href: rel + '(dashboard)/settings/security/preview.html' },
                { name: 'Team', href: rel + '(dashboard)/settings/team/invite/preview.html' },
                { name: 'Credits', href: rel + '(dashboard)/settings/billing/credits/preview.html' },
                { name: 'Usage', href: rel + '(dashboard)/settings/billing/usage/preview.html' },
                { name: 'Checkout', href: rel + '(dashboard)/settings/billing/checkout/preview.html' },
                { name: 'Prompts', href: rel + '(dashboard)/prompts/preview.html' },
                { name: 'Goals', href: rel + '(dashboard)/analytics/team-goals/preview.html' },
            ]
        },
    ];

    // Create nav container
    const nav = document.createElement('div');
    nav.id = 'prototype-nav';
    nav.innerHTML = `
        <style>
            #prototype-nav {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 99999;
                font-family: 'Inter', system-ui, sans-serif;
            }
            #prototype-nav .pn-bar {
                background: rgba(17, 24, 33, 0.95);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border-bottom: 1px solid rgba(255,255,255,0.1);
                display: flex;
                align-items: center;
                padding: 0 16px;
                height: 40px;
                gap: 4px;
                overflow-x: auto;
            }
            #prototype-nav .pn-bar::-webkit-scrollbar { height: 0; }
            #prototype-nav .pn-home {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px 12px;
                background: #1978e5;
                color: white;
                border-radius: 6px;
                text-decoration: none;
                font-size: 12px;
                font-weight: 700;
                white-space: nowrap;
                flex-shrink: 0;
            }
            #prototype-nav .pn-home:hover { background: #1565c0; }
            #prototype-nav .pn-section {
                position: relative;
                flex-shrink: 0;
            }
            #prototype-nav .pn-section-btn {
                padding: 4px 10px;
                font-size: 11px;
                font-weight: 600;
                color: #94a3b8;
                background: transparent;
                border: 1px solid transparent;
                border-radius: 6px;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.15s;
            }
            #prototype-nav .pn-section-btn:hover,
            #prototype-nav .pn-section.open .pn-section-btn {
                color: white;
                background: rgba(255,255,255,0.08);
                border-color: rgba(255,255,255,0.15);
            }
            #prototype-nav .pn-dropdown {
                display: none;
                position: absolute;
                top: calc(100% + 4px);
                left: 0;
                background: rgba(17, 24, 33, 0.98);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 8px;
                padding: 4px;
                min-width: 180px;
                box-shadow: 0 12px 40px rgba(0,0,0,0.5);
            }
            #prototype-nav .pn-section.open .pn-dropdown { display: block; }
            #prototype-nav .pn-dropdown a {
                display: block;
                padding: 6px 12px;
                font-size: 12px;
                color: #cbd5e1;
                text-decoration: none;
                border-radius: 6px;
                white-space: nowrap;
                transition: all 0.1s;
            }
            #prototype-nav .pn-dropdown a:hover {
                background: rgba(25, 120, 229, 0.2);
                color: white;
            }
            #prototype-nav .pn-dropdown a.pn-active {
                background: rgba(25, 120, 229, 0.3);
                color: #60a5fa;
                font-weight: 600;
            }
            #prototype-nav .pn-spacer {
                height: 40px;
            }
        </style>
        <div class="pn-bar">
            <a class="pn-home" href="${rel}prototype-index.html">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l-10 9h3v9h6v-6h2v6h6v-9h3z"/></svg>
                Sitemap
            </a>
            ${sections.map(s => `
                <div class="pn-section">
                    <button class="pn-section-btn">${s.label}</button>
                    <div class="pn-dropdown">
                        ${s.items.map(item => {
                            const isActive = window.location.pathname.endsWith(item.href.replace(/^(\.\.\/)+/, '/').replace(/^\.\//, '/')) ||
                                             window.location.href.includes(item.href.split('/').pop());
                            return `<a href="${item.href}" class="${isActive ? 'pn-active' : ''}">${item.name}</a>`;
                        }).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    document.body.prepend(nav);

    // Add spacer to push content down
    const spacer = document.createElement('div');
    spacer.className = 'pn-spacer';
    spacer.style.height = '40px';
    nav.insertAdjacentElement('afterend', spacer);

    // Toggle dropdown on click
    document.querySelectorAll('#prototype-nav .pn-section-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = btn.closest('.pn-section');
            const wasOpen = section.classList.contains('open');
            document.querySelectorAll('#prototype-nav .pn-section').forEach(s => s.classList.remove('open'));
            if (!wasOpen) section.classList.add('open');
            e.stopPropagation();
        });
    });

    // Close dropdowns on click outside
    document.addEventListener('click', () => {
        document.querySelectorAll('#prototype-nav .pn-section').forEach(s => s.classList.remove('open'));
    });
})();
