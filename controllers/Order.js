import Order from '../models/Order.js'
export const SaveOrder = async (req, res) => {
  const { username, items, totalPrice } = req.body;

  try {
    // Extract the item titles from the provided items
    const itemTitles = items.map(item => item.title);

    // Check if an order with the same item titles already exists for the user
    const existingOrder = await Order.findOne({
      username: username,
      'items.title': { $all: itemTitles },
    });

    if (existingOrder) {
      return res.status(400).json({ message: 'Order with these items already exists' });
    }

    // If no existing order is found, create and save the new order
    const newOrder = new Order({
      username,
      items,
      totalPrice,
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({ message: 'Order saved successfully', order: savedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save order', error });
  }
};

export const GetOrders=async (req, res) => {
    const { username } = req.params;
  
    try {
      const orders = await Order.find({ username });
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }