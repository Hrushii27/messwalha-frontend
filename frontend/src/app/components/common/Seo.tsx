import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SeoProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
}

const Seo: React.FC<SeoProps> = ({
    title = 'FindMess – Find the Best Mess & Tiffin Services Near You',
    description = 'FindMess helps students and PG residents discover affordable mess and tiffin services near them. Compare prices, reviews, and locations.',
    keywords = 'mess near me, tiffin service, student mess, PG food service, affordable mess, find mess India',
    image = '/og-image.png', // Optimized branding banner
    url = window.location.href,
}) => {
    const siteTitle = title.includes('FindMess') ? title : `${title} | FindMess`;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Facebook Meta Tags */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />

            {/* Twitter Meta Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
};

export default Seo;
