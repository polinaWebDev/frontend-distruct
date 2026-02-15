import { MainPage } from '@/domain/MainPage/MainPage';
import { Metadata } from 'next';
import { buildSocialMetadata } from '@/lib/seo';

export const metadata: Metadata = {
    title: 'Distruct',
    description: 'Distruct — игровые челленджи, новости, карты и рейтинги по популярным шутерам.',
    ...buildSocialMetadata(
        '/',
        'Distruct',
        'Distruct — игровые челленджи, новости, карты и рейтинги по популярным шутерам.'
    ),
};

export default async function Home() {
    return (
        <>
            <MainPage />
        </>
    );
}
