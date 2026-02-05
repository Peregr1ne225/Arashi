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
                <svg
                    width="400"
                    height="270"
                    viewBox="0 0 595.28 401.65"
                    style={{ marginBottom: 40 }}
                >
                    <path
                        fill="#0e4d80"
                        d="M117.07,103.05s227.92,44.7,361.13-60.98c0,0-1.18,88.21-193,142.67,0,0,98.67,3.55,153.53-41.05,0,0-36.7,125.51-136.16,118.01,0,0,6.71,56.83,33.15,97.88,0,0-69.86-82.49-89.2-133.01,0,0,54.07,9.47,82.88-14.21,0,0-70.25,9.47-128.66-30,0,0,87.53,5.47,154.71-50.52,0,0-143.27,37.89-238.38-28.81Z"
                    />
                </svg>
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
