import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import './tailwind.css';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const app = express();
app.use(cors());
app.use(express.json());

interface StripeDataResponse {
  charges: Stripe.Charge[];
  customers: Stripe.Customer[];
}

// Endpoint to fetch Stripe data
app.get('/api/stripe-data', async (req: Request, res: Response<StripeDataResponse | { error: string }>) => {
  try {
    const charges = await stripe.charges.list({ limit: 10 });
    const customers = await stripe.customers.list({ limit: 10 });
    
    res.json({
      charges: charges.data,
      customers: customers.data
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));