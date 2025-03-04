# big-money-board
Stripe wall display to showcase in your startup office

## Description
Big Money Board is a visual dashboard that displays your Stripe payment data in real-time, perfect for showcasing your company's revenue growth on office displays.

## Prerequisites
- Node.js (v14 or newer)
- npm or yarn
- A Stripe account with API access

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/big-money-board.git
cd big-money-board
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Stripe API keys and other configuration:
   ```
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

## Running the Application

### Development Mode
To run the application in development mode:

```bash
npm run dev
# or
yarn dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
To create a production build:

```bash
npm run build
# or
yarn build
```

To start the production server:

```bash
npm start
# or
yarn start
```

## Setting Up on a Display
For office wall displays:

1. Set up a tablet connected to the internet
2. Configure it to automatically boot to the browser
3. Set the browser to open the Big Money Board URL in full-screen mode
4. For maximum impact, consider setting up auto-refresh to keep data current

## Customization
You can customize the appearance and displayed metrics by modifying the configuration files in the project.

## Troubleshooting
- If you encounter connection issues, verify your Stripe API keys are correct
- For display problems, check your browser's console for error messages

## License
[Add your license information here]
