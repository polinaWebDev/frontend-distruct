import { MainPage } from '@/domain/MainPage/MainPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Distruct - Main',
};

export default async function Home() {
    return (
        <>
            <MainPage />
        </>
    );
}
