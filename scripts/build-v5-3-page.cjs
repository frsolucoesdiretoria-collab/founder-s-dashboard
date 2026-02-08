const fs = require('fs');
const path = require('path');

const INPUT_PATH = path.join(__dirname, '../public/v5-3/index.html');
const OUTPUT_PATH = path.join(__dirname, '../src/app/v5-3/page.tsx');
const ASSET_PREFIX = '/v5-3';

try {
    const htmlContent = fs.readFileSync(INPUT_PATH, 'utf8');

    // Extract body content
    // The file is mostly minified, so be careful with regex
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    let bodyContent = bodyMatch ? bodyMatch[1] : '';

    if (!bodyContent) {
        throw new Error("Could not find body content");
    }

    // Perform replacements for assets
    // We need to replace src="client/..." with src="${ASSET_PREFIX}/client/..."
    // And url('...') refs if any are inline.
    // Also data-src attributes for lazy loading.

    const replacements = [
        { from: /="client\//g, to: `="\${ASSET_PREFIX}/client/` },
        { from: /="template\//g, to: `="\${ASSET_PREFIX}/template/` },
        { from: /="uploads\//g, to: `="\${ASSET_PREFIX}/uploads/` },
        { from: /url\('uploads\//g, to: `url('\${ASSET_PREFIX}/uploads/` },
        { from: /url\('client\//g, to: `url('\${ASSET_PREFIX}/client/` },
        { from: /data-src="uploads\//g, to: `data-src="\${ASSET_PREFIX}/uploads/` },
        { from: /data-src="client\//g, to: `data-src="\${ASSET_PREFIX}/client/` },
        // Fix the specific case of background image url
        { from: /background: url\('uploads\//g, to: `background: url('\${ASSET_PREFIX}/uploads/` },
    ];

    replacements.forEach(rep => {
        bodyContent = bodyContent.replace(rep.from, rep.to);
    });

    // Escape backticks and backslashes for template literal
    const escapedBodyContent = bodyContent
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\$/g, '\\$');

    const componentTemplate = `import React, { useEffect, useRef } from 'react';

// Path prefix for assets moved to public/v5-3/
const ASSET_PREFIX = '${ASSET_PREFIX}';

export default function AxisV53Page() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 1. Dynamic CSS Loading
        const cssFiles = [
            "https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Round",
            "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css",
            "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
            \`\${ASSET_PREFIX}/client/css/uw-extended-colors.css\`,
            \`\${ASSET_PREFIX}/template/default/client/css/uw-animate%EF%B9%96v1770228129.css\`,
            \`\${ASSET_PREFIX}/template/default/client/css/uw-main%EF%B9%96v1%EF%B9%96v1770228129.css\`,
            \`\${ASSET_PREFIX}/template/default/client/css/uw-extended%EF%B9%96v1770228129.css\`,
            \`\${ASSET_PREFIX}/template/default/client/css/uw-dark-theme%EF%B9%96v1770228129.css\`,
            \`\${ASSET_PREFIX}/template/default/client/css/loading%EF%B9%96v10.css\`
        ];

        const links: HTMLLinkElement[] = [];
        cssFiles.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
            links.push(link);
        });

        // 2. Dynamic JS Loading
        const scriptFiles = [
            "https://code.jquery.com/jquery-3.6.3.min.js",
            "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js",
            "https://cdnjs.cloudflare.com/ajax/libs/particlesjs/2.2.3/particles.min.js",
            "https://cdn.jsdelivr.net/jquery.marquee/1.4.0/jquery.marquee.min.js",
            \`\${ASSET_PREFIX}/client/js/uw-main%EF%B9%96v9.js\`,
            \`\${ASSET_PREFIX}/template/default/client/js/uw-template%EF%B9%96v12%EF%B9%96v1770228129.js\`,
            \`\${ASSET_PREFIX}/template/default/client/js/webgl/dat.gui.min%EF%B9%96v1770228129.js\`,
            \`\${ASSET_PREFIX}/template/default/client/js/webgl/script.min%EF%B9%96v1770228129.js\`
        ];

        const scripts: HTMLScriptElement[] = [];
        
        const loadScriptsSequentially = async () => {
             for (const src of scriptFiles) {
                await new Promise<void>((resolve) => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.async = false;
                    script.onload = () => resolve();
                    script.onerror = () => {
                        console.error(\`Failed to load script: \${src}\`);
                        resolve(); 
                    };
                    document.body.appendChild(script);
                    scripts.push(script);
                });
             }
        };

        setTimeout(() => {
            loadScriptsSequentially();
        }, 100);

        return () => {
            links.forEach(link => link.remove());
            scripts.forEach(script => script.remove());
        };
    }, []);

    // Injected HTML Content from Reference
    const htmlContent = \`${escapedBodyContent}\`;

    return (
        <div 
            ref={containerRef}
            id="uw-root-container"
            style={{ 
                all: 'initial', 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                minHeight: '100vh',
                backgroundColor: '#000',
                zIndex: 9999,
                overflowX: 'hidden'
            }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
}
`;

    fs.writeFileSync(OUTPUT_PATH, componentTemplate);
    console.log("Success: Re-generated page.tsx with full content.");

} catch (err) {
    console.error(err);
    process.exit(1);
}
