import './NewsHtmlContent.css';

export const NewsHtmlContent = ({ content }: { content: string }) => {
    return (
        <div className={'news_html_content'} dangerouslySetInnerHTML={{ __html: content }}></div>
    );
};
