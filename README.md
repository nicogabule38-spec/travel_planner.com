# 🏝️ Travel Planner - Simple Website

A beautiful, simple travel planner website for the Philippines - perfect for beginners!

## 🚀 **SUPER EASY SETUP (Like htdocs)**

### **Method 1: Using XAMPP (Easiest for Beginners)**

1. **Open XAMPP Control Panel**
2. **Start Apache** (click "Start" next to Apache)
3. **Copy this folder to htdocs**:
   - Go to `C:\xampp\htdocs\`
   - Copy the entire `simple-website` folder there
   - Rename it to `travel-planner`
4. **Open your browser** and go to:
   ```
   http://localhost/travel-planner/
   ```

### **Method 2: Using Any Web Server**

1. **Copy this folder** to any web server
2. **Open the `index.html` file** in your browser
3. **That's it!** Your website is running

### **Method 3: Direct File Opening**

1. **Double-click** on `index.html`
2. **It will open** in your default browser
3. **Navigate between pages** using the menu

## 📁 **What You Have**

```
simple-website/
├── index.html              # Homepage
├── destinations.html       # Destinations page
├── itineraries.html       # Itineraries page
└── README.md              # This guide
```

## 🌟 **Features**

✅ **Beautiful Design** - Modern, responsive layout  
✅ **Mobile Friendly** - Works on phones and tablets  
✅ **Interactive** - Click buttons, search, filter  
✅ **No Database Needed** - Pure HTML/CSS/JavaScript  
✅ **Easy to Customize** - Simple code to modify  

## 🎨 **Customization**

### **Change Colors**
Edit the CSS in each HTML file:
```css
/* Change main color from blue to green */
background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
```

### **Add New Destinations**
In `destinations.html`, add new cards:
```html
<div class="destination-card" data-category="beach">
    <div class="destination-image">🏖️</div>
    <div class="destination-content">
        <h3>Your New Destination</h3>
        <p>Description here...</p>
        <a href="#" class="btn">View Details</a>
    </div>
</div>
```

### **Add New Pages**
1. Create new HTML file in the same folder
2. Copy the structure from existing pages
3. Update the navigation menu

## 🔧 **Advanced Features (Optional)**

### **Add a Contact Form**
```html
<form>
    <input type="text" placeholder="Your Name">
    <input type="email" placeholder="Your Email">
    <textarea placeholder="Your Message"></textarea>
    <button type="submit">Send Message</button>
</form>
```

### **Add Google Maps**
```html
<iframe src="https://www.google.com/maps/embed?pb=..." width="100%" height="300"></iframe>
```

### **Add Social Media Links**
```html
<a href="https://facebook.com">Facebook</a>
<a href="https://instagram.com">Instagram</a>
```

## 📱 **Mobile Testing**

1. **Open on your phone**:
   - If using XAMPP: `http://YOUR-COMPUTER-IP/travel-planner/`
   - Find your computer's IP: `ipconfig` in Command Prompt

2. **Test responsiveness**:
   - Resize browser window
   - Check on different devices

## 🚀 **Deploy Online (Optional)**

### **Free Hosting Options:**
1. **Netlify** - Drag and drop your folder
2. **Vercel** - Connect GitHub repository
3. **GitHub Pages** - Upload to GitHub repository

### **Steps for Netlify:**
1. Go to [netlify.com](https://netlify.com)
2. Drag your `simple-website` folder to the deploy area
3. Get your free URL (like `https://your-site.netlify.app`)

## 🎯 **Next Steps**

1. **Customize the content** - Add your own destinations
2. **Change colors and fonts** - Make it your own
3. **Add more pages** - Contact, About, etc.
4. **Add a backend** - When you're ready for user accounts
5. **Deploy online** - Share with the world!

## ❓ **Troubleshooting**

### **Website not loading?**
- Check if Apache is running in XAMPP
- Make sure files are in the right folder
- Try refreshing the page

### **Styling looks wrong?**
- Check if all CSS is properly formatted
- Make sure there are no missing `}` or `{`
- Try opening in a different browser

### **Want to add a database?**
- This is a static website (no database needed)
- For user accounts and data storage, you'll need a backend
- Consider learning PHP, Node.js, or Python

## 🎉 **You're Done!**

Your travel planner website is ready! It's simple, beautiful, and works perfectly for showcasing destinations and itineraries.

**Happy coding!** 🚀

---

## Progressive Web App (PWA) & Offline

This project now includes a basic PWA setup so you can install the site as an app and get offline pages for cached content.

What was added:
- `manifest.json` — metadata so browsers can install the app
- `service-worker.js` — caches core assets and serves `offline.html` when offline
- `js/pwa.js` — registers the service worker and shows an install button when supported
- `offline.html` — simple offline fallback page

Notes & caveats:
- Because this project uses PHP API endpoints (`api/`), true offline CRUD for the API requires additional server-side sync or turning the API into a client-side (local) store. The service worker caches static assets and navigations only.
- For the PWA install prompt to appear, serve the site over HTTPS or on `localhost`.

How to test locally:
1. Run with XAMPP (Apache) and visit `http://localhost/<your-folder>/`.
2. Open Chrome DevTools > Application to inspect the service worker and manifest.
3. Toggle offline in DevTools > Network to verify `offline.html` is shown for navigations.

Free online hosting suggestions:
- PHP-ready free hosts: InfinityFree, AwardSpace, 000WebHost (check current terms)
- For static-only hosting (no PHP), use Netlify, Vercel, or GitHub Pages.

Packaging as native apps (optional):
- Android: Use Trusted Web Activity (TWA) via Bubblewrap to wrap the PWA (requires HTTPS hosting). See https://developers.google.com/web/android/trusted-web-activity
- Desktop: Use Electron to wrap the site into a cross-platform desktop app.

If you want, I can:
1. Wire the service worker into all pages and make sure all top-level HTML files reference `manifest.json` and `js/pwa.js`.
2. Add more static assets to the precache list (icons, fonts, images) to improve offline UX.
3. Help set up a free hosting deployment or prepare a simple Electron or TWA build.

---

## Desktop: Electron build (Windows)

I added a minimal Electron wrapper so you can run the site as a desktop app. Files added:
- `package.json` (dev dependencies + start/pack scripts)
- `electron-main.js` (Electron entry)
- `preload.js` (minimal preload)

How to run locally (Windows PowerShell):
1. Install Node.js (if not already installed).
2. Open PowerShell in the project folder (the same folder with `index.html`).
3. Install dependencies and start Electron:

```powershell
npm install
npm start
```

Note on PHP APIs:
- If you rely on the local PHP endpoints (`api/*.php`), start XAMPP/Apache and set the `ELECTRON_START_URL` env var to your running site, for example:

```powershell
#$env:ELECTRON_START_URL = 'http://localhost/travel_planner final/' ; npm start
```

Packaging (simple):
- The `pack` script uses `electron-packager` to create a Windows build. Run:

```powershell
npm run pack
```

This produces an executable in the `dist/` folder.

If you'd like, I can:
- Add a small native menu, auto-updates, or code signing instructions.
- Create a ready-to-build Android TWA (Bubblewrap) configuration for a hosted HTTPS site.

---

## Deploying to a real domain (e.g. https://travel_planner.com)

Checklist to make the site fully functional when you publish to a domain:

1. HTTPS: PWAs and service workers require HTTPS. Obtain an SSL certificate (Let's Encrypt is free).
2. Place the site at the webroot of your domain (so `https://travel_planner.com/` serves `index.html`).
3. Ensure `manifest.json`, `service-worker.js`, and `/offline.html` are accessible at the root (not blocked by server rules).
4. Configure server for SPA routing. For Apache, `.htaccess` (already added) will redirect unknown paths to `index.html`.
5. Correct MIME types for `.json` and `.js` files (usually automatic on modern hosts).
6. Verify icons referenced in `manifest.json` exist and are reachable (e.g., `https://travel_planner.com/images/Journey-512.png`).
7. Test with Chrome DevTools > Application to confirm manifest & service worker registration.

If you give me access to the hosting (or tell me which host you'll use), I can prepare deployment steps specific to that provider and test the PWA install flow.