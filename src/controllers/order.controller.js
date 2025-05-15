const { Order, OrderItem, Product, User, sequelize } = require('../models');

exports.placeOrder = async (req, res) => {
  const userId = req.user.userId;
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain items.' });
  }

  const t = await sequelize.transaction();
  try {
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, {
        transaction: t,
      });
      if (!product || product.stock < item.quantity) {
        throw new Error(`Invalid or out-of-stock product: ${item.productId}`);
      }

      total += product.price * item.quantity;
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });

      product.stock -= item.quantity;
      await product.save({ transaction: t });
    }

    const order = await Order.create(
      { userId, totalPrice: total.toFixed(2) },
      { transaction: t }
    );

    for (const item of orderItems) {
      await OrderItem.create(
        { ...item, orderId: order.id },
        { transaction: t }
      );
    }

    await t.commit();
    res
      .status(201)
      .json({ message: 'Order placed successfully', orderId: order.id });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['id', 'name', 'price'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.userId },
      include: [
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['id', 'name', 'price'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch your orders' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['id', 'name', 'price'] }],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Allow if admin or owner
    if (req.user.isAdmin !== true && req.user.userId !== order.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

exports.editOrder = async (req, res) => {
  const orderId = req.params.id;

  try {
    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['id', 'name', 'price'] }],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = req.body.status;
    await order.save();

    res.status(200).json({ message: 'Order Edited Successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to edit order' });
  }
};

exports.cancelOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [OrderItem],
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.user.isAdmin !== true && req.user.userId !== order.userId) {
      await t.rollback();
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (order.status === 'delivering') {
      await t.rollback();
      return res.status(400).json({
        error: 'Order is already being delivered and cannot be cancelled.',
      });
    }

    // Restore stock
    for (const item of order.OrderItems) {
      const product = await Product.findByPk(item.productId, {
        transaction: t,
      });
      if (product) {
        product.stock += item.quantity;
        await product.save({ transaction: t });
      }
    }

    await OrderItem.destroy({ where: { orderId: order.id }, transaction: t });

    order.status = 'cancelled';
    await order.save({ transaction: t });

    await t.commit();

    res.status(200).json({ message: 'Order cancelled and stock restored' });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};
