# ASHA Saathi (आशा साथी) — 3-Minute Hackathon Pitch Script

> **Speaker Instructions**: Speak clearly and confidently at a conversational pace. Follow the timing cues to stay within the 3-minute limit.

---

### [0:00 - 0:25] The Hook & The Problem
> *"Good morning, judges. Imagine you are Sunita Devi, an ASHA healthcare worker in rural India. You are responsible for the health of 250 families across three villages. Every single day, you walk door-to-door carrying a canvas bag stuffed with ten heavy paper registers — one for antenatal visits, one for child vaccinations, one for your medicine kit, and several more.
>
> If a mother misses an iron supplement or a child misses a booster shot, it's buried across pages of handwriting. Worse yet, in half of the hamlets you visit, there is zero mobile reception. When digital apps require internet, they simply don't work in the field."*

---

### [0:25 - 0:50] The Solution & Core Innovation
> *"That is why we built **ASHA Saathi** — an offline-first, mobile digital field platform designed specifically for community health workers.
>
> What makes ASHA Saathi different is that it doesn't treat offline mode as an afterthought or an error state. Powered by IndexedDB and our custom synchronization engine, Sunita can register households, document home visits, schedule follow-ups, and request medicine refills completely offline. The app saves everything instantly on the device. When she returns to a village corner with cell signal, ASHA Saathi automatically reconciles all changes with our cloud PostgreSQL database in strict relational order — without creating duplicate records."*

---

### [0:50 - 1:40] The 3-Tier Workflow (The Live Demo)
> *"Let me show you how this closes the loop across all three levels of care:
>
> **First, the ASHA**: With one tap on her phone, Sunita logs into her dashboard. She immediately sees today's agenda: a pregnant patient, Pooja Sharma, who is at 18 weeks gestation. Sunita opens Pooja's profile, taps 'Record Visit', notes her blood pressure, and schedules next week's follow-up. When she notices her stock of Iron Folic Acid is running low, she submits a digital refill request right from her drug kit.
>
> **Second, the Supervisor**: At the sector office, Dr. Anita Roy logs into her supervision portal. She monitors field visit coverage across the sector and reviews Sunita's pending medicine requisition. With one tap, she approves the refill.
>
> **Third, the PHC Manager**: At the Central Primary Health Centre depot, manager Rajesh Sharma sees the approved order in his fulfillment queue. He fulfills the drug kit, which immediately updates central stock levels and notifies Sunita that her supplies are ready for pickup."*

---

### [1:40 - 2:20] Security, Privacy & Ergonomics
> *"Public healthcare data demands institutional security:
> - Every query is guarded by PostgreSQL **Row Level Security (RLS)** — an ASHA can only view her assigned families, while managers oversee depot logistics.
> - Because rural workers often share tablet devices, signing out instantly wipes the local IndexedDB cache, preventing any patient information from leaking to the next user.
> - The user interface is engineered for budget Android phones: large 48px touch targets, high sunlight contrast, and an instant toggle between English and Hindi."*

---

### [2:20 - 3:00] Conclusion & Future Scope
> *"ASHA Saathi is built on standard open web standards — React, Vite, TypeScript, Supabase, and Progressive Web Application technology. In the future, we plan to connect with the Ayushman Bharat Digital Mission (ABDM) and expand to regional languages like Marathi and Chhattisgarhi.
>
> By replacing cumbersome paper registers with an intelligent, offline-first digital companion, ASHA Saathi helps frontline health workers spend less time with paperwork and more time doing what matters most: saving lives in their communities.
>
> Thank you, and we welcome your questions!"*
