# 🌐 Namecheap DNS Setup for Hetzner

## Quick Setup (5 minutes)

You already have your domain on Namecheap. Now point it to your Hetzner server.

---

## Step 1: Get Your Hetzner Server IP

After creating your CPX11 server on Hetzner:
1. Log in to Hetzner Cloud Console
2. Find your server
3. **Copy the IP address** (e.g., 192.0.2.1)

---

## Step 2: Log In to Namecheap

1. Go to https://www.namecheap.com
2. Sign in with your account
3. Click **"Domain List"** in left menu
4. Find your domain and click **"Manage"**

---

## Step 3: Point Domain to Hetzner

### Method 1: Using Namecheap's DNS (Easiest) ⭐

1. Under **"Nameservers"** section
2. Select **"Namecheap BasicDNS"** (should be default)
3. Click **"Advanced DNS"** tab

### Add DNS Records:

#### A Record (Points to your server):
1. Click **"+ Add Record"**
2. Select **Type**: A
3. **Host**: @ (for root domain)
4. **Value**: YOUR_HETZNER_IP
5. **TTL**: 30 min (or Auto)
6. Click ✓

#### WWW Record (Optional but recommended):
1. Click **"+ Add Record"**
2. Select **Type**: A
3. **Host**: www
4. **Value**: YOUR_HETZNER_IP
5. **TTL**: 30 min
6. Click ✓

---

## Step 4: Wait for DNS Propagation

DNS changes can take 15 minutes to 24 hours (usually 15-30 minutes)

### Check if DNS is ready:

**Windows (PowerShell):**
```powershell
nslookup your-domain.com
```

**Mac/Linux:**
```bash
nslookup your-domain.com
dig your-domain.com
```

Should show your Hetzner IP address.

---

## Step 5: Verify Domain Points to Server

Once DNS is updated, test:

```bash
# Test A record
ping your-domain.com

# Should show your Hetzner IP address
```

---

## 🎯 QUICK CHECKLIST

- [ ] Create Hetzner CPX11 server
- [ ] Copy server IP address
- [ ] Log in to Namecheap
- [ ] Go to Domain > Manage > Advanced DNS
- [ ] Add A record: @ → YOUR_IP
- [ ] Add A record: www → YOUR_IP (optional)
- [ ] Wait 15 minutes for DNS
- [ ] Test: `nslookup your-domain.com`
- [ ] Deploy on Hetzner
- [ ] Access: http://your-domain.com

---

## ⚠️ IMPORTANT NOTES

### Don't change nameservers
- Keep "Namecheap BasicDNS" selected
- Only add A records in Advanced DNS
- Don't point to different nameservers

### TTL Explanation
- **30 min**: Changes propagate quickly (good for setup)
- **Auto/1hr**: Standard setting
- **High (24hrs)**: After setup, can increase for stability

### If DNS not working after 30 min
1. Check you copied IP correctly
2. Verify A record in Namecheap
3. Try: `nslookup your-domain.com 8.8.8.8` (Google DNS)
4. Clear local DNS cache: `ipconfig /flushdns` (Windows)

---

## 📋 YOUR DNS RECORDS

Once set up, you should have:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_HETZNER_IP | 30 min |
| A | www | YOUR_HETZNER_IP | 30 min |

---

## 🚀 NEXT STEPS

After DNS is pointing:

1. Deploy on Hetzner: `docker-compose up -d`
2. Get SSL certificate: `certbot certonly --standalone -d your-domain.com`
3. Enable HTTPS in nginx config
4. Test: https://your-domain.com
5. **LIVE!** 🎉

---

## 🆘 TROUBLESHOOTING

### "Domain not resolving"
- Wait longer (DNS can take up to 24 hours)
- Check A record exists in Namecheap
- Verify IP is correct

### "Wrong IP when I nslookup"
- Wait 30 minutes after adding record
- Clear DNS cache: `ipconfig /flushdns` (Windows)
- Try different DNS: `nslookup your-domain.com 8.8.8.8`

### "Can't connect after DNS works"
- Hetzner server not running
- Docker containers not started
- Nginx not configured

---

## 💡 AFTER DEPLOYMENT

Once everything works:

1. Change TTL to higher value (3600 or Auto) for stability
2. Consider adding MX records if you want email
3. Add SSL certificate and enable HTTPS
4. Test everything works: https://your-domain.com

---

**Your domain is now ready to point to Hetzner! 🎉**
