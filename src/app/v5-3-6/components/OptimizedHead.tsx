import Head from 'next/head';
import criticalCSS from './critical.css?inline'; // Vite inline import

const ASSET_PREFIX = '/v5-3-6';

export default function OptimizedHead() {
    return (
        <Head>
            {/* ========== PRECONNECTS - Reduz latência de DNS/SSL ========== */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
            <link rel="dns-prefetch" href="https://code.jquery.com" />

            {/* ========== PRELOAD - Imagem LCP (Hero) ========== */}
            <link
                rel="preload"
                as="image"
                href={`${ASSET_PREFIX}/images/imagens%20v5-3-4/hero.webp`}
                // @ts-ignore - imagesrcset não é reconhecido no TypeScript mas é válido em HTML
                imagesrcset={`
                    ${ASSET_PREFIX}/images/imagens%20v5-3-4/hero-small.webp 400w,
                    ${ASSET_PREFIX}/images/imagens%20v5-3-4/hero-medium.webp 800w,
                    ${ASSET_PREFIX}/images/imagens%20v5-3-4/hero.webp 1024w
                `}
                // @ts-ignore
                imagesizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1024px"
            />

            {/* ========== CSS CRÍTICO INLINE - Elimina bloqueio ========== */}
            <style
                dangerouslySetInnerHTML={{
                    __html: criticalCSS
                }}
            />

            {/* ========== META TAGS ========== */}
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="description" content="Axis Antivacância - O sistema que caça vagas vazias na sua agenda automaticamente" />

            {/* Theme color para mobile */}
            <meta name="theme-color" content="#000814" />
        </Head>
    );
}
