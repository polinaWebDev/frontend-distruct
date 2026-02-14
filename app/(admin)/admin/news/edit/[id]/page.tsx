import { CreateOrEditNewsPage } from '@/domain/admin/news/create-or-edit/create-or-edit-news-page';
import { newsControllerGetAllNews, newsControllerGetNewsById } from '@/lib/api_client/gen';
import { getServerClient } from '@/lib/api_client/server_client';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const client = await getServerClient();

    let newsData = null;
    try {
        const news = await newsControllerGetNewsById({
            client,
            path: {
                id: id,
            },
        });
        newsData = news.data ?? null;
    } catch {
        // Fallback to list endpoint (private news may not be available on /api/news/{id})
        newsData = null;
    }

    if (!newsData) {
        const limit = 50;
        const maxPages = 20;
        for (let page = 1; page <= maxPages; page += 1) {
            const list = await newsControllerGetAllNews({
                client,
                query: { page, limit },
            });
            const found = list.data?.data?.find((item) => item.id === id);
            if (found) {
                newsData = found;
                break;
            }
            if (!list.data?.data?.length) {
                break;
            }
        }
    }

    return <CreateOrEditNewsPage news={newsData ?? undefined} />;
}
