const fs = require('fs');
const path = require('path');

// Fixed paths
const INPUT_PATH = path.join(__dirname, '../public/Site de REFERÊNCIA 1 UNITE /unitedofweb.com/index.html');
const OUTPUT_PATH = path.join(__dirname, '../src/app/v5-3/page.tsx');
// Note: escaping spaces in path for string usage if needed, but here we use it as string literal in content
const BASE_URL = '/Site de REFERÊNCIA 1 UNITE /unitedofweb.com';

try {
    const htmlContent = fs.readFileSync(INPUT_PATH, 'utf8');

    // Extract body content
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    let bodyContent = bodyMatch ? bodyMatch[1] : '';

    if (!bodyContent) {
        console.error("Could not find body content or file is empty");
        // Fallback: try to read the whole file if body parsing fails (e.g. if minified weirdly)
        // But minified usually preserves tags.
        // If empty, maybe I should just use the whole htmlContent? No, double <html> tags is bad.
    }

    // Replacements
    const replacements = [
        { from: /="client\//g, to: `="${BASE_URL}/client/` },
        { from: /="template\//g, to: `="${BASE_URL}/template/` },
        { from: /="uploads\//g, to: `="${BASE_URL}/uploads/` },
        { from: /url\('uploads\//g, to: `url('${BASE_URL}/uploads/` },
        { from: /url\('client\//g, to: `url('${BASE_URL}/client/` },
        { from: /data-src="uploads\//g, to: `data-src="${BASE_URL}/uploads/` },
        { from: /data-src="client\//g, to: `data-src="${BASE_URL}/client/` },
    ];

    replacements.forEach(rep => {
        bodyContent = bodyContent.replace(rep.from, rep.to);
    });

    // Safety escape for template literal
    const escapedBodyContent = bodyContent
        .replace(/\\/g, '\\\\') // Escape backslashes first
        .replace(/`/g, '\\`')   // Escape backticks
        .replace(/\$/g, '\\$'); // Escape dollar signs

    const componentTemplate = `import React, { useEffect, useState } from 'react';

// Asset Base Path
const BASE_PATH = "${BASE_URL}";

export default function AxisV53Page() {
    // State to handle loading scripts/styles
    const [assetsLoaded, setAssetsLoaded] = useState(false);

    useEffect(() => {
        // Load Stylesheets
        const stylesheets = [
            "https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Round",
            "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css",
            "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
            \`\${BASE_PATH}/client/css/uw-extended-colors.css\`,
            \`\${BASE_PATH}/template/default/client/css/uw-animate%EF%B9%96v1770228129.css\`,
            \`\${BASE_PATH}/template/default/client/css/uw-main%EF%B9%96v1%EF%B9%96v1770228129.css\`,
            \`\${BASE_PATH}/template/default/client/css/uw-extended%EF%B9%96v1770228129.css\`,
            \`\${BASE_PATH}/template/default/client/css/uw-dark-theme%EF%B9%96v1770228129.css\`,
            \`\${BASE_PATH}/template/default/client/css/loading%EF%B9%96v10.css\`
        ];

        const links: HTMLLinkElement[] = [];
        stylesheets.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
            links.push(link);
        });

        // Load Scripts
        const scripts = [
            "https://code.jquery.com/jquery-3.6.3.min.js",
            "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js",
            "https://cdnjs.cloudflare.com/ajax/libs/particlesjs/2.2.3/particles.min.js",
            "https://cdn.jsdelivr.net/jquery.marquee/1.4.0/jquery.marquee.min.js",
            \`\${BASE_PATH}/client/js/uw-main%EF%B9%96v9.js\`,
            \`\${BASE_PATH}/template/default/client/js/uw-template%EF%B9%96v12%EF%B9%96v1770228129.js\`,
            \`\${BASE_PATH}/template/default/client/js/webgl/dat.gui.min%EF%B9%96v1770228129.js\`,
            \`\${BASE_PATH}/template/default/client/js/webgl/script.min%EF%B9%96v1770228129.js\`
        ];

        const loadScripts = async () => {
             for (const src of scripts) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.async = false;
                    script.onload = () => resolve();
                    script.onerror = () => reject();
                    document.body.appendChild(script);
                });
             }
             setAssetsLoaded(true);
        };

        // Delay slightly to ensure DOM is ready? 
        setTimeout(loadScripts, 100);

        return () => {
            links.forEach(link => {
                if(document.head.contains(link)) document.head.removeChild(link);
            });
        };
    }, []);

    return (
        <div 
            style={{ background: '#000', minHeight: '100vh', color: 'white', overflowX: 'hidden' }}
            dangerouslySetInnerHTML={{ __html: \`${escapedBodyContent}\` }}
        />
    );
}
`;

    fs.writeFileSync(OUTPUT_PATH, componentTemplate);
    console.log("Success: Generated page.tsx with " + bodyContent.length + " bytes of HTML.");
} catch (err) {
    console.error("Error:", err);
    process.exit(1);
}
