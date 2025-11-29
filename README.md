# Tima Sara Hotel Management System

Professional hotel website with integrated management system.

## File Structure

```
hotel-admin/
├── index.html                  # Main website
├── booking.html                # Booking page
├── gallery.html                # Gallery (all photos)
├── rooms.html                  # Rooms (uses same photos)
├── css/                        # Stylesheets
│   ├── style.css
│   └── admin-style.css
├── js/                         # JavaScript
│   ├── script.js
│   └── admin/                  # Admin scripts
│       ├── admin-script.js
│       ├── admin-dashboard.js
│       └── ...
├── images/                     # ALL images (one flat folder)
│   ├── logo.png
│   ├── room-101.jpg
│   ├── room-102.jpg
│   ├── pool.jpg
│   └── ... everything
├── admin/                      # Admin panel
│   ├── admin-login.html
│   ├── admin-dashboard.html
│   └── ...
└── assets/                     # Additional resources
```

## Image Organization

**Simple & Efficient:**
- All images in ONE folder: `images/`
- No subfolders (rooms/, gallery/)
- Same images used on multiple pages
- Gallery shows ALL photos
- Rooms page shows room photos (from same folder)
- NO duplication!

## File Paths

**Admin pages:** `<img src="../images/filename.jpg">`
**Website pages:** `<img src="images/filename.jpg">`

## Deployment

```bash
git add .
git commit -m "Professional structure"
git push
```

## Live Site

https://timasarahotel.com

## Admin Access

https://timasarahotel.com/admin/admin-login.html
