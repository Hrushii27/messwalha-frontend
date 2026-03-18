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
    title = 'MessWalha - #1 Mess Discovery Platform for Students',
    description = 'Find the best local mess services with healthy food and simplified weekly/monthly subscriptions. MessWalha connects students with verified messes.',
    keywords = 'mess discovery, student food, meal plans, indian mess, tiffin service, student subscription',
    image = '/vite.svg', // Replace with a real meta image when available
    url = window.location.href,
}) => {
    const siteTitle = title.includes('MessWalha') ? title : `${title} | MessWalha`;

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
