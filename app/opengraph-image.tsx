import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function OpenGraphImage() {
    return new ImageResponse(
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f172a 0%, #1f2937 45%, #0b1020 100%)',
                color: '#e2e8f0',
                fontSize: 64,
                fontWeight: 700,
                letterSpacing: -1,
            }}
        >
            <div style={{ fontSize: 24, opacity: 0.8, marginBottom: 16 }}>Distruct</div>
            <div style={{ fontSize: 64 }}>Челленджи. Карты. Новости.</div>
        </div>,
        size
    );
}
