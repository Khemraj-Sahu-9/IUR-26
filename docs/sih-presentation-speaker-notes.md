# ASHA Worker Digital Platform - SIH 2026 Speaker Notes

## Slide 1: Title Slide
"Good morning, respected judges. We are [Team Name] from [College Name]. Today, we are proud to present our solution for the Smart India Hackathon: The ASHA Worker Digital Platform, an offline-first healthcare ecosystem designed specifically for rural India."

## Slide 2: Problem Statement
"ASHA workers are the backbone of India's rural healthcare, yet they rely on an antiquated, fragile paper-based system. They carry multiple heavy registers, leading to data loss, high redundancy, and severe delays in critical areas like tracking high-risk pregnancies or replenishing essential medicines. Furthermore, in many rural sectors, internet connectivity is intermittent or non-existent, making standard web applications useless."

## Slide 3: Existing vs Proposed System
"Currently, an ASHA records a visit on paper, and days later, someone manually enters it into a PHC computer—causing massive delays and errors. Our proposed platform changes this. We replace paper with a single source of truth on a mobile device. We provide automated scheduling, instant alerts, and most importantly, an offline-first digital infrastructure that works flawlessly without an internet connection."

## Slide 4: Our Solution
"Our solution is a unified ecosystem connecting the field to the administration. We built a Progressive Web Application (PWA) tailored for three distinct roles: the ASHA worker on a mobile phone, the Sector Supervisor on a tablet, and the Primary Health Centre (PHC) Manager on a desktop. No matter the device or location, the workflow is entirely digitized."

## Slide 5: Key Features
"The platform covers the entire ASHA mandate. It manages household structures and individual patient profiles. It deeply tracks maternal care, including ANC/PNC visits, and child immunizations. It handles inventory and medicine requests. Built as a PWA, it supports English and Hindi seamlessly, and relies on strict Role-Based Access Control to ensure data privacy."

## Slide 6: End-to-End Workflow
"Let's look at the daily workflow. An ASHA starts her day by logging in and syncing her assigned households. On her dashboard, she sees her pending tasks. She walks to a village, visits a household, selects a patient, and adds a visit record. She enters vitals and notes completely offline. Later, when she returns to an area with network coverage, the app automatically uploads all her records to the cloud."

## Slide 7: Offline-First Innovation
"Our biggest technical achievement is the Offline-First architecture. By utilizing Service Workers, the app shell loads instantly even in airplane mode. We use IndexedDB via Dexie.js for a robust local database. The user interface is optimistic—it responds instantly. Any changes made offline are queued locally and synchronized seamlessly in the background when connectivity is restored."

## Slide 8: Synchronization Algorithm
"Data sync is complex, especially with relational data. Our synchronization engine uses lock-based concurrency to prevent race conditions. We implemented topological ordering—meaning households sync before patients, and patients sync before visits, respecting foreign-key constraints. We also use client-generated UUIDs, ensuring that if a network drops mid-sync, retries are idempotent and never create duplicate records."

## Slide 9: Technical Architecture
"Technically, the frontend is built with React, TypeScript, and Vite, styled with Tailwind CSS. The offline engine leverages Workbox and Dexie.js. Our backend is powered by Supabase, running a robust PostgreSQL 17 database. The frontend is hosted on Vercel for edge delivery, while Supabase handles data, authentication, and security."

## Slide 10: Backend + Data Architecture
"Our data model is highly relational, consisting of 14 core tables including users, households, patients, pregnancies, and visits. We enforce strict relational integrity with foreign keys and cascading behaviors at the database level. Using UUIDs generated on the client side is the secret to allowing complete offline record creation without conflicts."

## Slide 11: Security & Compliance
"Security is paramount in healthcare. We use secure JWT-based sessions. Data access is locked down using PostgreSQL Row Level Security (RLS) policies—26 distinct policies ensure an ASHA can only see her assigned households, while a supervisor sees their sector. We also maintain strict audit logs for all critical data mutations."

## Slide 12: Three-Role Ecosystem
"The application dynamically adapts to the user's role. The ASHA worker sees a mobile-optimized interface for field entry. The Supervisor accesses a dashboard to monitor sector activity, track high-risk pregnancies, and approve medicine requests. The Manager gets a high-level view of inventory, stock requisitions, and overall operational reporting."

## Slide 13: Innovation & Differentiation
"What sets us apart is true offline capability. Many apps are 'offline-viewing'; ours allows full, offline data creation. Our deterministic deduplication prevents messy data conflicts. Furthermore, the UI is hyper-optimized for low-end Android devices typically used in the field, and features a one-tap language switch that doesn't require a page reload."

## Slide 14: Feasibility, Scalability & Future
"The platform is highly feasible. It relies on open-source technologies and serverless infrastructure, keeping operational costs extremely low. It requires minimal training for ASHA workers. In the future, we plan to integrate AI-powered predictive alerts for high-risk pregnancies, integrate with the Ayushman Bharat Health Account (ABHA) network, and introduce voice-based data entry."

## Slide 15: Demo & Closing
"To conclude: our mission is to digitize the field workflow and keep it working when connectivity does not. We will now transition to a brief live demonstration of the platform. Thank you, and we welcome your questions."
