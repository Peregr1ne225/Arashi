import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'Arashi Sportwear'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 128,
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    textAlign: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ color: '#0e4d80', fontWeight: 'bold' }}>ARASHI</div>
                <div style={{ fontSize: 32, marginTop: 24, letterSpacing: 10, textTransform: 'uppercase', color: '#666' }}>
                    Chase The Unseen
                </div>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    )
}
