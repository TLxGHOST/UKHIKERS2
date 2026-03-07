import razorpay from "../config/razorpay.js";

export const createOrder = async(req,res)=>{

try{

const { amount } = req.body;

const order = await razorpay.orders.create({

amount: amount * 100,
currency:"INR"

});

res.json(order);

}catch(err){

console.error(err);

res.status(500).json({
message:"Order creation failed"
});

}

};