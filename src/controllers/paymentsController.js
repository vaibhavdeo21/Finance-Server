const Razorpay = require ('razorpay');
const { CREDIT_TO_PAISA_MAPPING } = require('../constants/paymentConstants');

const razorpayClient = new Razorpay ({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const paymentsController = {
    //step 2 from sequence diagram
    createOrder: async (request, response) => {
        try{
            const {credits} = request.body;

            if(!CREDIT_TO_PAISA_MAPPING[credits]){
                return response.status(400).json({
                    message: 'Invalid credits value.'});
            }

            const amountInPaise = CREDIT_TO_PAISA_MAPPING[credits];

            const order = await razorpayClient.orders.createOrder({
                amount: amountInPaise,
                currency: 'INR',
                receipt: `receipt_${Date.now()}`
            });

            return response.json({
                order: order
            });

        } catch (error) {
            return response.status(500).json({ error: 'Internal Server error.' });
        }
    },
    verifyOrder: async (request, response) => {
        try{

        } catch (error){
            return response.status(500).json({ error: 'Internal Server error.' });
        }
    }
};


module.exports = paymentsController;