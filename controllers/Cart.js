import { CartModel } from "../models/Cart.js";
export const AddToCart= async (req, res) => {
  const { promptId,username } = req.body;
 // Get username from token

  try {
    // Check if the item with the same promptId already exists in the cart for this user
    const existingCartItem = await CartModel.findOne({ username, promptId });

    if (existingCartItem) {
      // If the item exists, increment the quantity
      await existingCartItem.save();
      res.status(200).json({ message: 'Item quantity updated successfully' });
    } else {
      // If it doesn't exist, create a new cart item with quantity 1
      const newCartItem = new CartModel({ username, promptId });
      await newCartItem.save();
      res.status(201).json({ message: 'Item added to cart successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to add item to cart', error });
  }
};

export const GetCartItems=async (req, res) => {
  const { username } = req.query; // Get username from query

  try {
    const cartItems = await CartModel.find({ username }).populate('promptId');
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cart items', error });
  }
};
export const UpdateQuantity=async (req, res) => {
  const { itemId, quantity } = req.body;

  try {
    // Update the quantity of the item in the database
    await CartModel.updateOne(
      { _id: itemId },
      { $inc: { quantity } } // Increment or decrement the quantity
    );
    res.status(200).json({ message: 'Quantity updated' });
  } catch (error) {
    console.error('Failed to update quantity', error);
    res.status(500).json({ message: 'Failed to update quantity' });
  }
};
export const RemoveItem= async (req, res) => {
  const { itemId } = req.body;

  if (!itemId) {
    return res.status(400).json({ error: 'Item ID is required' });
  }

  try {
    // Remove item from the user's cart
    await CartModel.deleteOne({ _id: itemId });
    res.status(200).json({ message: 'Item removed successfully' });
  } catch (error) {
    console.error('Failed to remove item from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
}
export const ClearCart=async (req, res) => {
  const { username } = req.body;

  try {
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Delete all cart items associated with the given username
    await CartModel.deleteMany({ username });

    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}