const mongoose = require("mongoose");
const coffeeSupporterSchema = new mongoose.Schema({
  support_id: Number,
  support_note: String,
  support_coffees: Number,
  transaction_id: String,
  support_visibility: Number,
  support_created_on: String,
  support_updated_on: String,
  transfer_id: String,
  supporter_name: String,
  support_coffee_price: String,
  support_email: String,
  is_refunded: Number,
  support_currency: String,
  referer: String,
  country: String,
  order_payload: String,
  support_hidden: Number,
  refunded_at: String,
  payer_email: String,
  payment_platform: String,
  payer_name: String,
});

module.exports = mongoose.model("coffees-supporter", coffeeSupporterSchema);
