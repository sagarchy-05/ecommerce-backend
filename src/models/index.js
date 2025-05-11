const sequelize = require('../config/database');
const User = require('./user.model');
const Category = require('./category.model');
const Product = require('./product.model');
const Order = require('./order.model');
const OrderItem = require('./orderItem.model');
const Address = require('./address.model');
const ProductImage = require('./productImage.model');

const db = {
  sequelize,
  User,
  Category,
  Product,
  Order,
  OrderItem,
  Address,
  ProductImage,
};

// Associations
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(Address, { foreignKey: 'userId' });
Address.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(ProductImage, { foreignKey: 'productId' });
ProductImage.belongsTo(Product, { foreignKey: 'productId' });

module.exports = db;
