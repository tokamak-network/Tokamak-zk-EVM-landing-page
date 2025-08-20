# Tokamak zk-EVM Landing Page

A modern, interactive landing page for Tokamak's zero-knowledge Ethereum Virtual Machine (zk-EVM). Built with Next.js 15, React 19, and Tailwind CSS, featuring immersive animations and comprehensive product information.

## 🚀 Features

- **Interactive Hero Section**: Dynamic particle system with mouse-following effects and click animations
- **Responsive Design**: Fully responsive layout optimized for all device sizes
- **Modern UI/UX**: Clean, professional design with smooth animations and transitions
- **Performance Optimized**: Built with Next.js 15 and Turbopack for lightning-fast development
- **TypeScript**: Full TypeScript support for type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development

## 🏗️ Project Structure

```
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   └── components/          # React components
│       ├── CustomCursor.tsx
│       ├── FAQSection.tsx
│       ├── Footer.tsx
│       ├── Hero.tsx         # Main hero section with animations
│       ├── HowItWorksSection.tsx
│       ├── Navbar.tsx
│       ├── QuickStartSection.tsx
│       ├── RoadmapSection.tsx
│       ├── SecuritySection.tsx
│       ├── ThreeWaysSection.tsx
│       ├── WhoSection.tsx
│       └── WhyDifferentSection.tsx
├── public/
│   └── assets/              # Static assets and images
└── tailwind.config.ts       # Tailwind configuration
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Runtime**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Development**: Turbopack for fast builds

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tokamak-network/Tokamak-zk-EVM-landing-page.git
cd Tokamak-zk-EVM-landing-page
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

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 📜 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

## 🎨 Design Features

### Interactive Elements
- **Particle System**: Dynamic floating particles with color variations and animations
- **Mouse Interactions**: Elements that respond to mouse movement and clicks
- **Smooth Animations**: CSS and JavaScript animations for enhanced user experience
- **Geometric Shapes**: Floating geometric elements with hover effects

### Responsive Design
- Mobile-first approach
- Breakpoint-optimized layouts
- Touch-friendly interactions on mobile devices

## 🔧 Customization

### Styling
The project uses Tailwind CSS for styling. You can customize the design by:

1. Modifying `tailwind.config.ts` for theme customization
2. Updating component-specific styles in individual component files
3. Adding custom CSS in `src/app/globals.css`

### Content
- Update component content in the respective files under `src/components/`
- Modify hero section messaging in `src/components/Hero.tsx`
- Add or remove sections by editing `src/app/page.tsx`

## 📦 Deployment

### Vercel (Recommended)
The easiest way to deploy this Next.js application:

1. Push your code to a Git repository
2. Import the project in [Vercel](https://vercel.com/new)
3. Vercel will automatically detect Next.js and deploy your application

### Other Platforms
The application can be deployed on any platform that supports Node.js:

- **Netlify**: Connect your Git repository and deploy
- **AWS Amplify**: Use the Amplify Console for deployment
- **Heroku**: Deploy using the Heroku CLI
- **Self-hosted**: Build the application and serve the generated files

For more deployment options, check the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the terms specified in the `LICENSE` file.

## 🔗 Links

- [Tokamak Network](https://tokamak.network/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev/)

---

Built with ❤️ by the Tokamak Network team
