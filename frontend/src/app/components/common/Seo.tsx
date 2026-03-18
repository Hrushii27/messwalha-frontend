import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SeoProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    schema?: object;
    robots?: string;
}

const Seo: React.FC<SeoProps> = ({
    title = 'FindMess – Elite Mess & Tiffin Discovery Platform',
    description = 'Discover premium mess and tiffin services. FindMess provides students and PG residents with an elite culinary discovery experience with verified reviews and secure subscriptions.',
    keywords = 'premium mess, tiffin service, student dining, elite mess discovery, verified mess reviews, FindMess',
    image = '/og-banner.png',
    url = window.location.href,
    schema,
    robots = 'index, follow',
}) => {
    const siteTitle = title.includes('FindMess') ? title : `${title} | FindMess`;
    const canonical = url.split(/[?#]/)[0];

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={canonical} />
            <meta name="robots" content={robots} />
            <meta name="theme-color" content="#0F172A" />

            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}

            {/* Social Meta Tags */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={canonical} />
            <meta property="og:site_name" content="FindMess" />

            {/* Twitter Meta Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
};

export default Seo;
