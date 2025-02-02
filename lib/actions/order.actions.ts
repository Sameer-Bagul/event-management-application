"use server"

// import Stripe from 'stripe';
import { CheckoutOrderParams, CreateOrderParams, GetOrdersByEventParams, GetOrdersByUserParams } from "@/types"
import { redirect } from 'next/navigation';
import { handleError } from '../utils';
import { connectToDatabase } from '../database';
import Order from '../database/models/order.model';
import Event from '../database/models/event.model';
import {ObjectId} from 'mongodb';
import User from '../database/models/user.model';
import mongoose from "mongoose";

export const checkoutOrder = async (order: CheckoutOrderParams) => {
//   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const price = order.isFree ? 0 : Number(order.price) * 100;

//   try {
//     const session = await stripe.checkout.sessions.create({
//       line_items: [
//         {
//           price_data: {
//             currency: 'usd',
//             unit_amount: price,
//             product_data: {
//               name: order.eventTitle
//             }
//           },
//           quantity: 1
//         },
//       ],
//       metadata: {
//         eventId: order.eventId,
//         buyerId: order.buyerId,
//       },
//       mode: 'payment',
//       success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`,
//       cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`,
//     });

//     redirect(session.url!)
//   } catch (error) {
//     throw error;
//   }
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

    // Step 1: Check if userId is a valid ObjectId string
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId: Cannot convert to ObjectId");
    }

    // Step 2: Convert userId (Clerk ID string) to MongoDB ObjectId
    const objectIdUser = new mongoose.Types.ObjectId(userId); // Convert string to ObjectId

    // Step 3: Define query conditions using the ObjectId for the buyer field
    const skipAmount = (Number(page) - 1) * limit;
    const conditions = { buyer: objectIdUser }; // Use ObjectId for buyer field

    // Step 4: Query orders and populate event details and organizer
    const orders = await Order.find(conditions)  // Removed distinct() for better population support
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)
      .populate({
        path: 'event',  // Populate the event field
        model: Event,
        populate: {
          path: 'organizer',
          model: User,
          select: '_id firstName lastName',
        },
      });

    // Step 5: Get the count of orders for pagination
    const ordersCount = await Order.countDocuments(conditions);

    return { data: JSON.parse(JSON.stringify(orders)), totalPages: Math.ceil(ordersCount / limit) };
  } catch (error) {
    handleError(error);
  }
}
