# PayStore — Next.js Payment Frontend

This project is built with Next.js (App Router) + TypeScript + Tailwind CSS.
It is a frontend for a Java Spring Boot payment microservice that supports **PayPal**, **Razorpay**, and **PhonePe**.

## Project Structure

- `src/types/` — TypeScript interfaces matching backend DTOs
- `src/lib/api.ts` — API client for `/api/v1/payments` endpoints
- `src/lib/products.ts` — Mock product catalogue (replace with real API)
- `src/context/CartContext.tsx` — Cart state management (React Context + useReducer)
- `src/components/` — Reusable UI components
- `src/app/` — Next.js App Router pages

## Environment Variables

Copy `.env.example` to `.env.local` and update:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_URL` | Java backend base URL (default: `http://localhost:8080`) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key (for Checkout.js) |

## Conventions

- Use Tailwind CSS utility classes for styling
- All pages are client components (`"use client"`)
- API calls go through `src/lib/api.ts`
- Types mirror the Java backend DTOs
