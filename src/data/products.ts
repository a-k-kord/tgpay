import { Product } from '../features/payment/types';

export const products: Product[] = [
    {
        id: 'digital-course-js',
        name: 'JavaScript Mastery Course',
        description: 'Complete JavaScript course from beginner to advanced. Includes 50+ hours of video content, exercises, and projects.',
        price: 1, // 1 Telegram Star
        image: '/images/js-course.jpg',
        category: 'Education',
        inStock: true,
    },
    {
        id: 'ebook-react-guide',
        name: 'React Development Guide',
        description: 'Comprehensive e-book covering React fundamentals, hooks, state management, and best practices.',
        price: 1, // 1 Telegram Star
        image: '/images/react-ebook.jpg',
        category: 'Education',
        inStock: true,
    },
    {
        id: 'premium-templates',
        name: 'Premium UI Templates Pack',
        description: 'Collection of 20+ professional UI templates for web and mobile applications. Includes Figma files.',
        price: 1, // 1 Telegram Star
        image: '/images/ui-templates.jpg',
        category: 'Design',
        inStock: true,
    },
    {
        id: 'coding-bootcamp',
        name: 'Full-Stack Bootcamp Access',
        description: 'One-month access to our intensive full-stack development bootcamp with live sessions and mentorship.',
        price: 1, // 1 Telegram Star
        image: '/images/bootcamp.jpg',
        category: 'Education',
        inStock: true,
    },
    {
        id: 'ai-tool-subscription',
        name: 'AI Assistant Pro (1 Month)',
        description: 'Premium subscription to our AI-powered development assistant with unlimited queries and advanced features.',
        price: 1, // 1 Telegram Star
        image: '/images/ai-assistant.jpg',
        category: 'Tools',
        inStock: true,
    },
    {
        id: 'mobile-app-icons',
        name: 'Mobile App Icons Bundle',
        description: 'Collection of 500+ high-quality mobile app icons in multiple formats (SVG, PNG). Perfect for any project.',
        price: 1, // 1 Telegram Star
        image: '/images/mobile-icons.jpg',
        category: 'Design',
        inStock: true,
    },
    {
        id: 'web-dev-toolkit',
        name: 'Web Developer Toolkit',
        description: 'Essential tools and utilities for web developers including code snippets, cheat sheets, and browser extensions.',
        price: 1, // 1 Telegram Star
        image: '/images/dev-toolkit.jpg',
        category: 'Tools',
        inStock: false, // Example of out-of-stock item
    },
    {
        id: 'design-system',
        name: 'Complete Design System',
        description: 'Professional design system with components, color palettes, typography, and style guides for modern applications.',
        price: 1, // 1 Telegram Star
        image: '/images/design-system.jpg',
        category: 'Design',
        inStock: true,
    },
    {
        id: 'api-documentation',
        name: 'API Development Masterclass',
        description: 'Learn to build, document, and maintain robust APIs. Includes real-world examples and best practices.',
        price: 1, // 1 Telegram Star
        image: '/images/api-course.jpg',
        category: 'Education',
        inStock: true,
    },
    {
        id: 'growth-hacking-guide',
        name: 'Startup Growth Hacking Guide',
        description: 'Proven strategies and tactics for rapid startup growth. Case studies from successful companies included.',
        price: 1, // 1 Telegram Star
        image: '/images/growth-guide.jpg',
        category: 'Business',
        inStock: true,
    }
];

export const categories = [
    'All',
    'Education',
    'Design',
    'Tools',
    'Business'
];

export const getProductById = (id: string): Product | undefined => {
    return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
    if (category === 'All') {
        return products;
    }
    return products.filter(product => product.category === category);
};