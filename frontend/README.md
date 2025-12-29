# E-Commerce Fashion Store

A modern, responsive e-commerce platform built with Next.js 16, React 19, and Tailwind CSS. This application features a clean design, optimized performance, and a component-based architecture that follows best practices for server and client components.

## Features

- 🛍️ Modern product catalog with filtering and search
- 📱 Fully responsive design for all devices
- ⚡ Optimized performance with server/client component architecture
- 🎨 Clean, minimalist UI with Tailwind CSS
- 🏗️ Component-based architecture with reusable components
- 🖼️ Optimized images with lazy loading
- 🛒 Shopping cart functionality
- ❤️ Product wishlist
- 👤 User account management

## Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/)
- **Frontend**: [React 19](https://reactjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **TypeScript**: Full type safety throughout the application
- **Font Optimization**: Next.js font optimization

## Project Structure

```
app/
├── components/
│   ├── layout/                 # Header, Footer components
│   │   ├── HeaderParts/        # Header sub-components
│   │   └── Footer.tsx
│   ├── product/                # Product-related components
│   │   ├── ProductCardParts/   # ProductCard sub-components
│   │   ├── ProductGrid.tsx     # Server component
│   │   ├── ProductGridClient.tsx # Client component
│   │   └── ProductSkeleton.tsx # Loading state
│   ├── shared/                 # Shared utility components
│   └── ui/                     # UI components
│       ├── CategorySectionParts/ # Category section sub-components
│       └── CategorySection.tsx
├── lib/                        # Utilities and data
├── pages/                      # Route pages
└── globals.css                 # Global styles
```

## Architecture Highlights

### Server/Client Component Strategy

This application leverages Next.js 16's App Router to implement an optimized server/client component architecture:

- **Server Components**: Handle data fetching, static content, and non-interactive UI elements
- **Client Components**: Manage interactivity, user events, and state changes
- **Hybrid Approach**: Combines server-side rendering with client-side interactivity for optimal performance

### Component Decomposition

The application follows a component decomposition strategy where large components are broken down into smaller, focused components:

- **Single Responsibility**: Each component has a clear, focused purpose
- **Reusability**: Smaller components can be reused across the application
- **Maintainability**: Easier to understand, test, and modify individual components

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/ecom.git
cd ecom/frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Performance Optimizations

The application includes several performance optimizations:

1. **Server Components**: Reduces client-side JavaScript bundle size
2. **Lazy Loading**: Defers loading of off-screen images
3. **Component Memoization**: Prevents unnecessary re-renders
4. **Code Splitting**: Components are loaded only when needed
5. **Font Optimization**: Optimized font loading with display:swap

## Development

The page auto-updates as you edit the file. You can start editing by modifying `app/page.tsx`.

### Component Development

When creating new components:

1. Determine if it should be a server or client component
2. Break down large components into smaller, focused pieces
3. Follow the established naming conventions and directory structure
4. Use TypeScript for type safety

### Styling

The application uses Tailwind CSS for styling. Utility classes are used throughout the application for consistent design.

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [React Documentation](https://react.dev) - learn about React features
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about utility-first CSS framework

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
