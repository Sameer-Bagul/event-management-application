import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request : Request) {
    try {
        // const { userId } = await auth();
        // if(!userId) {
        //     return new Response('Unauthorized', { status: 401 });
        // }
        const { amount } = await request.json();
        const order = await razorpay.orders.create({
            amount,
            currency: 'INR',
            receipt: 'receipt_'+ Math.random().toString(36).substring(7),
        });
        return NextResponse.json( {orderId : order.id} ,{status: 200});
    } catch (error) {
        console.error("creating order error", error);
        return new Response('creating order error', { status: 500 });   
    }
}