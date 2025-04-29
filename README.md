# TK Designer - Picsart and Shopify Integration

This project is a web application that allows customers to create their own designs using Picsart Photo Editor and purchase these designs as DTF Transfer products through Shopify.

## Features

- Picsart Photo Editor integration for custom design creation
- DTF Transfer product options (size, quantity, color)
- Shopify integration for product creation and checkout
- Responsive design for both desktop and mobile users

## Technologies Used

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Picsart Editor SDK
- Shopify Storefront API
- Vercel Deployment

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Picsart API Key
- Shopify store credentials

### Installation

1. Clone the repository:
```bash
git clone https://github.com/transferkingdom/tkdesigner.git
cd tkdesigner
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your API keys:
```env
# Picsart API
PICSART_API_KEY=your-api-key
NEXT_PUBLIC_PICSART_API_KEY=your-public-api-key

# Shopify
SHOPIFY_SHOP=your-shop.myshopify.com
SHOPIFY_ADMIN_API_PASSWORD=your-password
NEXT_PUBLIC_SHOPIFY_DOMAIN=your-shop.myshopify.com
NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN=your-storefront-access-token
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app                   # Next.js App Router
  /api                 # API routes
  /components          # React components
    /editor            # Picsart editor components
    /products          # Shopify product components 
    /checkout          # Checkout components
  /context             # React context providers
  /hooks               # Custom React hooks
  /utils               # Utility functions
```

## Deployment

This project is designed to be deployed to Vercel:

1. Push your code to GitHub
2. Import the project into Vercel
3. Set up the environment variables in Vercel
4. Deploy

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Picsart SDK](https://picsart.io/sdk)
- [Shopify Storefront API](https://shopify.dev/docs/api/storefront)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
