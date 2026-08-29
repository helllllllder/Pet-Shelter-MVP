# 🐾 Pet Shelter MVP — Quickstart User Guide

Welcome to the **Offline-First Pet Shelter Management Application**! This guide gets you up and running in under 2 minutes.

---

## ⚡ 1. First-Time Setup & Registration (FR01)
1. **Launch the App**: When launched for the first time, you will be prompted to create your **Operator Profile**.
2. **Enter Details**: Provide your Full Name and Email address (e.g. `Jane Doe`, `jane@shelter.org`).
3. **Automatic Login**: On subsequent launches on the same device, you are automatically logged in.

---

## 🏠 2. Create or Switch Shelter (FR02, FR04)
1. **Create Shelter**: Enter your facility name (e.g. `Downtown Rescue Hub`).
2. **Multi-Shelter Management**: You can manage multiple shelters from one device.
3. **Switch Context**: Use the top shelter dropdown to switch between facilities. Any uncommitted form data is protected with a dirty-state confirmation warning.

---

## 🐶 3. Pet Intake & Profiles (FR05–FR09)
1. **Register Animal**: Tap **+ Add Pet**. Provide Name, Species (Dog, Cat, Bird, Small Furry, Reptile), Breed, Sex, and Estimated/Exact Date of Birth.
2. **Record Intake**: Specify intake origin (Owner Surrender, Stray, Rescue Transfer, etc.).
3. **Adoption & Outcome**: When a pet is adopted, tap **Set Outcome**, record the adopter's full name, phone number, physical address, and adoption fee.

---

## 🩺 4. Vet Directory & Appointments (FR11–FR14)
1. **Directory**: Browse or add veterinary clinics and licensed vets with emergency contact numbers.
2. **Schedule Appointment**: Link a pet to an upcoming vet checkup, surgery, or vaccination.
3. **Retroactive Logging**: Record emergency clinic visits that happened earlier with doctor's notes and file attachments.

---

## 💉 5. Care Events & Medical Recurrence (FR15–FR17)
1. **Schedule Care**: Record medications, vaccinations, deworming, or dietary regimens.
2. **Recurrence**: Set repeat rules (Daily, Weekly, Monthly, Annually).
3. **Due-Date Alerts**: View badge indicators for medical procedures due today or overdue.

---

## 📦 6. Inventory & Stock Alerts (FR19, FR20)
1. **Track Items**: Manage items across 5 categories: `Food`, `Medication`, `Cleaning Supplies`, `Equipment`, and `Other`.
2. **Stock Adjustments**: Update quantities in real-time (Kilograms, Liters, Units, Milliliters).
3. **Configure Alert Rules**: Set minimum stock thresholds or expiration window warnings (e.g., alert when < 10 doses or < 30 days to expiration).

---

## ⚡ 7. 1-Click Usage Templates (FR21)
1. **Create Template Bundles**: Define reusable kits (e.g., *"Puppy Intake Pack"* = 1 Distemper Vaccine + 1 Syringe + 1 Microchip).
2. **Apply with Care Events**: Recording a routine treatment automatically decrements all template stock in a single click.

---

## 🛠️ 8. Facility Maintenance Tasks (FR22, FR23)
1. **Schedule Tasks**: Plan `Repair`, `Preventive Maintenance`, or `Cleaning` tasks with assigned staff and recurrence rules.
2. **Completion Logs**: Log completed tasks with the operator's name, timestamp, and notes.
3. **Overdue Badges**: Track overdue tasks on the dashboard.

---

## 🔔 9. Notifications & Alert Escalation (FR24, FR25)
1. **In-App Badges**: Standard alerts (care due, low stock) appear immediately in the app banner.
2. **External Dispatch**: Custom alerts route to configured email/SMS channels.
3. **3-Retry Escalation**: If an external message fails 3 times, an emergency high-visibility alert banner appears on the dashboard with 1-click dismissal.

---

## 💾 10. Data Privacy & JSON Export (FR03, NFR16)
- **Local Data Export**: Export complete shelter records into a single tamper-evident JSON file with SHA-256 integrity checksums.
- **GDPR Erasure**: Permanently purge PII (adopter contact info) while preserving anonymized intake and medical logs.
