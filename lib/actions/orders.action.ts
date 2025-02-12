"use server"
import { CheckoutOrderParams, CreateOrderParams, GetOrdersByEventParams, GetOrdersByUserParams } from "@/types"
import { redirect } from 'next/navigation';
import { handleError } from '../utils';
import { connectToDatabase } from '../database';
import Order from '../database/models/order.model';
import Event from '../database/models/event.model';
import {ObjectId} from 'mongodb';
import User from '../database/models/user.model';
import mongoose from "mongoose";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const checkoutOrder = async (order: CheckoutOrderParams) => {
  const price = 100 * 100;

  try {
    const Response = await fetch('/api/orders', {method:'POST'});
    const data = await Response.json();
    const options = {
        key: process.env.RAZORPAY_KEY_ID,
        amount : price,
        currency: 'INR',
        name: 'Evento', 
        description: 'Payment for Event',
        order_id: data.id,
        handler: function(response: any){
            fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...order,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpaySignature: response.razorpay_signature,
                })
            })
            .then(() => {
                redirect('/orders');
            })
            .catch((error) => {
                handleError(error);
            });
        },
        prefill:{
            name: order.buyerId,
            email: order.buyerId,
            contact: order.buyerId,
        },
        theme:{
            color:"#3399cc",
        }
    }
    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    handleError(error);
  }
}

export const createOrder = async (order: CreateOrderParams) => {
  try {
    await connectToDatabase();
    const newOrder = await Order.create({
      ...order,
      event: order.eventId,
      buyer: order.buyerId,
    });

    return JSON.parse(JSON.stringify(newOrder));
  } catch (error) {
    handleError(error);
  }
}

// GET ORDERS BY EVENT
export async function getOrdersByEvent({ searchString, eventId }: GetOrdersByEventParams) {
  try {
    await connectToDatabase()

    if (!eventId) throw new Error('Event ID is required')
    const eventObjectId = new ObjectId(eventId)

    const orders = await Order.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'buyer',
          foreignField: '_id',
          as: 'buyer',
        },
      },
      {
        $unwind: '$buyer',
      },
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'event',
        },
      },
      {
        $unwind: '$event',
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          createdAt: 1,
          eventTitle: '$event.title',
          eventId: '$event._id',
          buyer: {
            $concat: ['$buyer.firstName', ' ', '$buyer.lastName'],
          },
        },
      },
      {
        $match: {
          $and: [{ eventId: eventObjectId }, { buyer: { $regex: RegExp(searchString, 'i') } }],
        },
      },
    ])

    return JSON.parse(JSON.stringify(orders))
  } catch (error) {
    handleError(error)
  }
}
export async function getOrdersByUser({
  userId,
  limit = 3,
  page,
}: GetOrdersByUserParams) {
  try {
    await connectToDatabase();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId: Cannot convert to ObjectId");
    }
    const objectIdUser = new mongoose.Types.ObjectId(userId); 
    const skipAmount = (Number(page) - 1) * limit;
    const conditions = { buyer: objectIdUser }; 

    const orders = await Order.find(conditions)  
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)
      .populate({
        path: 'event', 
        model: Event,
        populate: {
          path: 'organizer',
          model: User,
          select: '_id firstName lastName',
        },
      });

    const ordersCount = await Order.countDocuments(conditions);

    return { data: JSON.parse(JSON.stringify(orders)), totalPages: Math.ceil(ordersCount / limit) };
  } catch (error) {
    handleError(error);
  }
}