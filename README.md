# Event Management Application 🎫

<div align="center">

**A full-stack, modern event management and ticketing platform built to handle scheduling, organization, attendee tracking, and payments seamlessly.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![Tailwind](https://img.shields.io/badge/TailwindCSS-3-cyan)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Features](#-key-features) • [System Architecture](#-system-architecture) • [Database Design](#-database-design) • [Quick Start](#-quick-start)

</div>

---

## 📸 Project Media

![App Screenshot](assets/screenshot.png)

*(Add screenshots of the Event Dashboard, Ticketing Page, and Admin interface here)*

[Watch Demo Video](assets/demo.mp4)

---

## 🎯 Key Features

✅ **Comprehensive Event Tracking** - Easily create, publish, and manage detailed events with dates, locations, and capacities.  
✅ **Secure Authentication** - Integrated **Clerk Auth** for a robust, secure, and customizable login experience.  
✅ **Ticketing & Payments** - Built-in **Razorpay** integration to handle secure ticket purchases and transactions.  
✅ **Media Management** - Seamless integration with **Uploadthing** for uploading and hosting high-quality event banners and media.  
✅ **Webhook Syncing** - Utilizes **Svix** for robust webhook handling (syncing Clerk users with the database).  
✅ **Modern UI/UX** - Clean, accessible, and responsive interface powered by **Tailwind CSS** and **Shadcn/UI** components.  
✅ **Dark Mode Support** - Full dark/light mode functionality using `next-themes`.

---

## 🏗 System Architecture

The application is built on modern React Server Components (RSC) using the **Next.js 15 App Router**. It employs a Serverless architecture, leveraging third-party APIs to handle heavy lifting (Auth, Payments, Media) while keeping the core server logic minimal.

```mermaid
graph TD
    Client[Client Browser]
    
    subgraph Frontend [Next.js App Router]
        UI[React 19 Server/Client Components]
        SA[Server Actions]
    end

    subgraph External Services
        Clerk[Clerk Auth]
        Razorpay[Razorpay Payments]
        UploadThing[UploadThing CDN]
        Svix[Svix Webhooks]
    end

    subgraph Backend Services
        API[Next.js API Routes]
        DB[(MongoDB Atlas)]
    end

    Client <--> UI
    UI -->|Mutations/Data Fetching| SA
    SA -->|Mongoose ORM| DB

    Client -->|Login/Signup| Clerk
    Clerk -->|Webhook Sync| Svix
    Svix -->|POST /api/webhook/clerk| API
    API -->|Create/Update User| DB

    Client -->|Upload File| UploadThing
    UploadThing -->|Returns URL| UI

    Client -->|Checkout| Razorpay
    Razorpay -->|Payment Confirm Webhook| API
    API -->|Create Order| DB
```

### Server Actions Architecture
Instead of traditional REST APIs, the application heavily uses **Next.js Server Actions** (`lib/actions/*`) for database operations. This provides end-to-end type safety and significantly reduces client-side JavaScript.

- `user.actions.ts`: Handles User creation, updating, and deletion (triggered via Clerk Webhooks).
- `event.actions.ts`: Handles Event creation, retrieval, updating, and deletion.
- `category.actions.ts`: Manages dynamic event categories.
- `orders.action.ts`: Handles ticket purchasing logic and order history tracking.

---

## 🗄 Database Design

The data layer uses **MongoDB** connected via **Mongoose**. Below is the Entity-Relationship overview:

```mermaid
erDiagram
    USER ||--o{ EVENT : "creates / organizes"
    USER ||--o{ ORDER : "purchases"
    EVENT ||--o{ ORDER : "has tickets"
    CATEGORY ||--o{ EVENT : "categorizes"

    USER {
        ObjectId _id PK
        String clerkId UK
        String email
        String username
        String firstName
        String lastName
        String photo
    }

    EVENT {
        ObjectId _id PK
        String title
        String description
        String location
        Date startDateTime
        Date endDateTime
        String imageUrl
        String price
        Boolean isFree
        String url
        ObjectId categoryId FK
        ObjectId organizerId FK
    }

    CATEGORY {
        ObjectId _id PK
        String name UK
    }

    ORDER {
        ObjectId _id PK
        String razorpayId UK
        String totalAmount
        ObjectId eventId FK
        ObjectId buyerId FK
        Date createdAt
    }
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local or Atlas Cluster)
- **Clerk Account** (For Authentication)
- **Uploadthing Account** (For Media)
- **Razorpay Account** (For Payments)

### 1. Clone & Install
```bash
git clone https://github.com/Sameer-Bagul/event-management-application.git
cd event-management-application

npm install
```

### 2. Configure Environment
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```
*(Populate with your API keys. See [Configuration](#-configuration) below).*

### 3. Start Development Server
```bash
npm run dev
```
*The application will be available at `http://localhost:3000`.*

---

## 🔧 Configuration (.env.local)

```env
# NEXT.JS CONFIG
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# MONGODB CONFIG
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/eventsDB

# CLERK AUTH
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# UPLOADTHING (Media)
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...

# RAZORPAY (Payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

---

## 🤝 Contributing

Contributions are always welcome!
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -m 'Add some NewFeature'`)
4. Push to the branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## 📝 License & Contact

This project is licensed under the MIT License.

**Author**: Sameer Bagul  
**GitHub**: [github.com/Sameer-Bagul](https://github.com/Sameer-Bagul)
