import Stripe from 'stripe';
import 'dotenv/config'; 
// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.SECRET_KEY); // Replace with your Stripe secret key
export const CheckoutSession=async (req, res) => {

    const { items, totalPrice, personalInfo } = req.body;
  
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map(item => ({
          price_data: {
            currency: 'inr',
            product_data: {
              name: item.promptId.title,
            },
            unit_amount: item.promptId.price * 100, // Amount in the smallest currency unit
          },
          quantity: item.quantity || 1,
        })),
        mode: 'payment',
        customer_email: personalInfo.email,
        billing_address_collection: 'required',
        success_url: `http://localhost:3000/${encodeURIComponent(personalInfo.firstName)}/success`,
        cancel_url: 'http://localhost:3000/cancel',
        metadata: {
          customer_name: `${personalInfo.firstName} ${personalInfo.lastName}`,
          customer_address: personalInfo.address,
          customer_country: personalInfo.country,
          customer_postal_code: personalInfo.postalCode,
        },
      });
  
      res.json({ id: session.id });
    } catch (error) {
      console.error('Error creating Checkout session:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
