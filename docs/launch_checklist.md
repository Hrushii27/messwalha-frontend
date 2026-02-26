# 🚀 Final Launch Guidance

This guide breaks down the three final steps to take **MessWalha** from your computer to the real world.

---

## 1. Get Your Razorpay Live API Keys
To accept real money, you must switch from "Test Mode" to "Live Mode".

1.  **Log in**: Go to the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2.  **Toggle Live Mode**: In the top right corner, switch the toggle from "Test Mode" to **Live Mode**.
3.  **KYC Check**: If you haven't completed your KYC, Razorpay will ask you for a **"Website/App URL"**.
    *   **What to use**: Use your main domain (e.g., `https://messwalha.com`).
    *   **If not live yet**: If you haven't pointed your domain yet, you can use the IP address of your VPS (e.g., `http://123.45.67.89`) or provide a link to your Business Profile/LinkedIn if you are in the "Individual" category.
4.  **Generate Keys**:
    *   Navigate to **Settings** -> **API Keys**.
    *   Click **Generate Key ID and Secret**.
    *   **CRITICAL**: Copy the `Key Secret` immediately and save it in a password manager. You won't be able to see it again.
5.  **Update `.env`**: Put these real keys into your production `.env` file under `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.

---

## 2. Provision a VPS (Virtual Private Server)
I recommend **DigitalOcean** for its simplicity, but AWS or Google Cloud work too.

1.  **Sign Up**: Create an account on [DigitalOcean](https://www.digitalocean.com/).
2.  **Create a Droplet**:
    *   **OS**: Choose **Ubuntu 22.04 LTS (x64)**.
    *   **Plan**: Basic (Shared CPU). $12/mo or $18/mo (2GB RAM / 1 CPU) is perfect for starting.
    *   **Region**: Select a data center closest to your users (e.g., Bangalore for India).
3.  **Authentication**: Use **SSH Keys** (follow their guide to generate one) for maximum security.
4.  **IP Address**: Once created, you will get an IP address (e.g., `123.45.67.89`). This is your server's "home".

---

## 3. Launching the Site (The "Aha!" Moment)
Now, use the **[Deployment Guide](file:///c:/Users/Admin/.gemini/antigravity/playground/sonic-pinwheel/messwalha/docs/deployment_guide.md)** I wrote for you. Here is the simplified logic:

1.  **Connect to Server**: Open your terminal and type:
    ```bash
    ssh root@YOUR_SERVER_IP
    ```
2.  **Install Docker**: Run the commands in Section 2 of the guide.
3.  **Upload Code**: Use Git to clone your code onto the server.
4.  **Configure**: Create the `.env` file and paste your **Live Keys** and **Database URL**.
5.  **Run**: `docker-compose up -d --build`.

---

## 🎁 Free Domain Alternatives
Getting a professional `.com` domain usually costs about ₹800-₹1200 per year. If you want something for free, consider these options:

### 1. Free Subdomains (Recommended)
Hosting platforms like **Render**, **Railway**, and **Vercel** provide free subdomains.
- **Example**: `messwalha.onrender.com`
- **Cost**: ₹0
- **Pros**: Zero setup, SSL included.

### 2. GitHub Student Developer Pack
If you are a student, you can get:
- A free **.me** domain for 1 year via **Namecheap**.
- A free domain for 1 year via **Name.com**.
- [Sign up here](https://education.github.com/pack) with your student ID.

### 3. Dynamic DNS (DuckDNS / No-IP)
Used mostly for home testing. They give you URLs like `messwalha.duckdns.org`.
- [DuckDNS](https://www.duckdns.org/)

> [!TIP]
> For a **"Real Website"** that owners will trust, I strongly recommend eventually buying a `.com` or `.in`. It makes your business look much more professional!
