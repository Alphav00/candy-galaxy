# 🍬 Candy Galaxy - Deployment Guide

## 🚀 Quick Deploy to Vercel (Recommended - 5 Minutes)

### Method 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Sign up/login (use GitHub account)

2. **Upload This Project:**
   - Click "Add New Project"
   - Click "Browse" or drag this entire folder
   - Or click "Import Git Repository" if you pushed to GitHub

3. **Configure:**
   - Project Name: `candy-galaxy` (or your choice)
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Click "Deploy"

4. **Wait 2-3 minutes** for build to complete

5. **Done!** You'll get a URL like:
   `https://candy-galaxy-yourname.vercel.app`

---

### Method 2: Deploy via Vercel CLI (For Advanced Users)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (run from this directory)
vercel --prod
```

---

## 🌐 Your Live Game URL

After deployment, share this URL with anyone:
- Works on mobile and desktop
- No installation needed
- Instant play in browser

---

## 🎮 Local Development (Optional)

To run locally before deploying:

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser
http://localhost:3000
```

---

## 📱 Post-Deployment Checklist

- [ ] Test game on mobile (iOS Safari, Android Chrome)
- [ ] Verify localStorage saves work
- [ ] Check all evolution stages
- [ ] Test mini-game
- [ ] Verify audio works
- [ ] Check Easter eggs (Konami Code, special names)

---

## 🐛 Troubleshooting

**Build fails?**
- Make sure Node.js version is 18+ (Vercel uses Node 20 by default)
- Check build logs in Vercel dashboard

**Game loads but blank screen?**
- Check browser console (F12) for errors
- Try different browser (Chrome, Safari, Firefox)

**Performance issues?**
- Vercel automatically optimizes
- Uses CDN for fast global delivery
- Should run at 60fps on most devices

---

## 🎨 Custom Domain (Optional)

After deployment, you can add a custom domain:
1. Go to Vercel project settings
2. Click "Domains"
3. Add your domain (e.g., `candygalaxy.com`)
4. Follow DNS configuration steps

---

## 📊 Analytics (Optional)

Vercel includes free analytics:
- Go to project dashboard
- Click "Analytics" tab
- See visitor stats, performance metrics

---

## 🔄 Updates

To update the live game:
1. Make changes to code locally
2. Push to GitHub (if using Git method)
3. Or run `vercel --prod` again (if using CLI)
4. Vercel auto-deploys on every push

---

## 💡 Tips

- **Free Tier:** Vercel free tier is perfect for this game
- **Performance:** Vercel edge network = fast worldwide
- **SSL:** Automatic HTTPS on all deployments
- **Zero Config:** Just deploy, everything works

---

**Need Help?** 
- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support

🎮 **Happy Deploying!** Your Valentine's game will be live in minutes!
