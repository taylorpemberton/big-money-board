interface ChargeEvent {
  type: 'charge';
  status: 'succeeded' | 'failed' | 'pending';
  amount: number;
  currency: string;
  countryFlag: string;
  timestamp: string;
  details: string;
}

interface CustomerEvent {
  type: 'customer';
  email: string;
  timestamp: string;
  details: string;
}

interface SubscriptionEvent {
  type: 'subscription';
  email: string;
  plan: string;
  amount: number;
  currency: string;
  quantity: number;
  timestamp: string;
  details: string;
}

type SampleEvent = ChargeEvent | CustomerEvent | SubscriptionEvent;

// Helper function to generate random status
const getRandomStatus = () => {
  const statuses = ['succeeded', 'failed', 'pending'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Helper function to get country flag based on currency
const getCountryFlag = (currency: string) => {
  const flags = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    JPY: '🇯🇵',
    CAD: '🇨🇦',
    AUD: '🇦🇺',
    INR: '🇮🇳'
  };
  return flags[currency] || '🌍';
};

export const sampleEvents: SampleEvent[] = [
    {
      type: 'charge',
      status: 'failed',
      amount: 4.20,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T08:28:00Z',
      details: 'Application Fee failed'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 4.20,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T09:07:00Z',
      details: 'Application Fee charged'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 8.98,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T09:08:00Z',
      details: 'Application Fee charged'
    },
    {
      type: 'charge',
      status: 'failed',
      amount: 110.00,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T09:11:00Z',
      details: 'Invoice charge failed'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 79.00,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T09:35:00Z',
      details: 'Invoice charge succeeded'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 4.20,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T09:36:00Z',
      details: 'Application Fee charged'
    },
    {
      type: 'charge',
      status: 'failed',
      amount: 1.32,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T09:37:00Z',
      details: 'Application Fee failed'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 4.00,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T09:53:00Z',
      details: 'Application Fee charged'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 3.60,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T09:54:00Z',
      details: 'Application Fee charged'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 0.60,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T09:56:00Z',
      details: 'Application Fee charged'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 4.00,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T10:20:00Z',
      details: 'Application Fee charged'
    },
    {
      type: 'customer',
      email: 'jorgedgodoy@gmail.com',
      timestamp: '2023-07-20T10:29:00Z',
      details: 'New customer'
    },
    {
      type: 'subscription',
      email: 'jorgedgodoy@gmail.com',
      plan: 'base-graduated',
      amount: 0,
      currency: 'USD',
      quantity: 1,
      timestamp: '2023-07-20T10:30:00Z',
      details: 'New subscription'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 49.00,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T10:44:00Z',
      details: 'Invoice charge failed (card was declined)'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 4.20,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T10:54:00Z',
      details: 'Application Fee charged'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 9.00,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T10:55:00Z',
      details: 'Application Fee charged'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 3.60,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T11:03:00Z',
      details: 'Application Fee charged'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 4.21,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T11:19:00Z',
      details: 'Application Fee charged'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 4.02,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T11:22:00Z',
      details: 'Application Fee charged'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 3.20,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T11:47:00Z',
      details: 'Application Fee charged'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 5.04,
      currency: 'EUR',
      countryFlag: getCountryFlag('EUR'),
      timestamp: '2023-07-20T11:55:00Z',
      details: 'Application Fee charged'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 69.00,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T11:59:00Z',
      details: 'Invoice charge succeeded'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 3.60,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T12:00:00Z',
      details: 'Application Fee charged'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 4.20,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T12:06:00Z',
      details: 'Application Fee charged'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 4.20,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T12:18:00Z',
      details: 'Application Fee charged'
    },
    {
      type: 'customer',
      email: 'alijraheem40@gmail.com',
      timestamp: '2023-07-20T12:19:00Z',
      details: 'New customer'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 99.00,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T12:30:00Z',
      details: 'Invoice charge failed (card was declined)'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 19.00,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T12:33:00Z',
      details: 'Invoice charge failed (card was declined)'
    },
    {
      type: 'subscription',
      email: 'alijraheem40@gmail.com',
      plan: 'pro-graduated',
      amount: 19,
      currency: 'USD',
      quantity: 1,
      timestamp: '2023-07-20T12:33:00Z',
      details: 'New subscription'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 19.00,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T12:33:00Z',
      details: 'Invoice charge failed (card was declined)'
    },
    {
      type: 'customer',
      email: 'thepchmtch@gmail.com',
      timestamp: '2023-07-20T12:38:00Z',
      details: 'New customer'
    },
    {
      type: 'charge',
      status: getRandomStatus(),
      amount: 4.20,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T12:43:00Z',
      details: 'Application Fee charged'
    },
    {
      type: 'customer',
      email: 'kinzialvesfit@gmail.com',
      timestamp: '2023-07-20T12:46:00Z',
      details: 'New customer'
    },
    {
      type: 'subscription',
      email: 'kinzialvesfit@gmail.com',
      plan: 'base-graduated',
      amount: 0,
      currency: 'USD',
      quantity: 1,
      timestamp: '2023-07-20T12:48:00Z',
      details: 'New subscription'
    },
    {
      type: 'charge',
      status: 'failed',
      amount: 29.99,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T13:15:00Z',
      details: 'Subscription charge failed'
    },
    {
      type: 'charge',
      status: 'failed',
      amount: 49.99,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T13:45:00Z',
      details: 'Monthly plan charge failed'
    },
    {
      type: 'charge',
      status: 'failed',
      amount: 9.99,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T14:00:00Z',
      details: 'Add-on charge failed'
    },
    {
      type: 'charge',
      status: 'failed',
      amount: 199.99,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T14:30:00Z',
      details: 'Enterprise plan charge failed'
    },
    {
      type: 'charge',
      status: 'failed',
      amount: 14.99,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T15:00:00Z',
      details: 'Trial conversion charge failed'
    },
    {
      type: 'charge',
      status: 'failed',
      amount: 99.99,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T15:30:00Z',
      details: 'Annual subscription charge failed'
    },
    {
      type: 'charge',
      status: 'failed',
      amount: 4.99,
      currency: 'USD',
      countryFlag: getCountryFlag('USD'),
      timestamp: '2023-07-20T16:00:00Z',
      details: 'Microtransaction charge failed'
    },
].map(event => {
  if (event.type === 'charge') {
    return {
      ...event,
      status: getRandomStatus(),
      countryFlag: getCountryFlag(event.currency)
    };
  }
  return event;
});