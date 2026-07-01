# ShopHub E-Commerce Project

This workspace contains the complete source code for the ShopHub e-commerce platform. The project is separated into three main directories, each serving a specific role in the system architecture.

## 📁 Project Structure

### 1. `shophub/` (Backend System)
- **Technology:** Java, Spring Boot, Maven, JPA/Hibernate.
- **Description:** Provides the core RESTful APIs, handles database interactions, authentication, and business logic for both the client and admin applications.
- **Running Locally:**
  ```bash
  cd shophub
  # Using Maven
  ./mvnw spring-boot:run
  ```

### 2. `ShopAppClient/` (Customer Storefront)
- **Technology:** Next.js, React, TypeScript, Tailwind CSS, NextAuth.
- **Description:** The user-facing website where customers can browse products, add items to their cart, and proceed to checkout.
- **Running Locally:**
  ```bash
  cd ShopAppClient/frontendclient
  npm install
  npm run dev
  ```

### 3. `AdminManager/` (Admin Dashboard)
- **Technology:** React / Next.js, TypeScript.
- **Description:** The back-office control panel for store administrators to manage products, categories, users, and orders.
- **Running Locally:**
  ```bash
  cd AdminManager/myadminapp
  npm install
  npm run dev
  ```

---

## 🔒 Environment Variables

Each application requires its own set of environment variables to run properly (e.g., database connection strings, JWT secrets, OAuth keys). 
- For Next.js projects, use `.env.local`
- For Spring Boot, use `.env` or configure `application.properties`

**Note:** Environment files are excluded from version control for security reasons.

## 🚀 Getting Started

To run the entire system locally, you should ideally start the **shophub** backend first, so that the frontend applications have an API to connect to. Then, you can start the `ShopAppClient` and/or `AdminManager` as needed.
