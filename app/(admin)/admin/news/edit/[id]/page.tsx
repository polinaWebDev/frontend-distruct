import { CreateOrEditNewsPage } from '@/domain/admin/news/create-or-edit/create-or-edit-news-page';
import { newsControllerGetNewsById } from '@/lib/api_client/gen';
import { getServerClient } from '@/lib/api_client/server_client';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const news = await newsControllerGetNewsById({
        client: await getServerClient(),
        path: {
            id: id,
        },
    });

    return <CreateOrEditNewsPage news={news.data} />;
}
