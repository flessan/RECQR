# RECQR

A modern, open-source QR code platform built with Next.js 14+, Material Design 3, and TypeScript. Hosted on GitHub Pages.

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/rocket.svg" width="24" height="24" align="top" /> Features

### For Users
- **Instant QR Scanning** - Real-time camera scanning with jsQR
- **QR Code Generation** - Create custom QR codes with ease
- **Smart Actions** - Automatic detection and execution of QR code actions
- **Multiple Input Methods** - Camera, file upload, drag-and-drop
- **Scan History** - Keep track of all your scans
- **Favorites** - Save important QR codes
- **Safe Scanning** - Security checks and warnings

### For Developers
- **Cloudflare Workers API** - Ultra-fast edge API for integration
- **SDK Libraries** - JavaScript, React, Flutter, Node.js
- **Dynamic QR Codes** - Create and manage dynamic QR codes
- **Analytics** - Track scans, locations, devices
- **Webhooks** - Real-time notifications
- **Documentation** - Comprehensive guides and references

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/palette.svg" width="24" height="24" align="top" /> Design

Built with **Material Design 3** (Material You):
- Responsive design
- Beautiful animations
- Dynamic colors
- Dark mode / Light mode
- Rounded corners
- Soft elevation
- Clean typography

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/wrench.svg" width="24" height="24" align="top" /> Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with MD3 theme
- **Animations**: Framer Motion
- **State Management**: Zustand
- **QR Decoding**: jsQR

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/package.svg" width="24" height="24" align="top" /> Installation

```bash
# Clone the repository
git clone https://github.com/flessan/RECQR.git

# Navigate to project directory
cd RECQR

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/hammer.svg" width="24" height="24" align="top" /> Build & Deploy

### Frontend (GitHub Pages)
```bash
# Build for production (Static Export)
npm run build
```

### API (Cloudflare Workers)
The API runs on Cloudflare Workers for blazing-fast global edge performance.

```bash
cd worker
npm install
npm run deploy # requires Wrangler CLI authentication
```

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/smartphone.svg" width="24" height="24" align="top" /> Pages

- `/` - Landing page
- `/scanner` - QR Scanner
- `/features` - Features overview
- `/documentation` - Documentation
- `/api` - API reference
- `/support` - Support & FAQ
- `/donate` - Support the project

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/lock.svg" width="24" height="24" align="top" /> Security

- Client-side QR decoding (no server upload required)
- Safe URL handling
- Permission management for camera
- No automatic execution of dangerous actions
- User confirmation for sensitive actions

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/globe.svg" width="24" height="24" align="top" /> Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/file-text.svg" width="24" height="24" align="top" /> License

MIT License - see [LICENSE](LICENSE) for details

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/users.svg" width="24" height="24" align="top" /> Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/heart-handshake.svg" width="24" height="24" align="top" /> Support

If you find this project helpful, please consider:
- <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/star.svg" width="16" height="16" align="text-bottom" /> Starring the repository
- <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/bug.svg" width="16" height="16" align="text-bottom" /> Reporting bugs
- <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/lightbulb.svg" width="16" height="16" align="text-bottom" /> Suggesting features
- <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/coffee.svg" width="16" height="16" align="text-bottom" /> Buying me a coffee

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/mail.svg" width="24" height="24" align="top" /> Contact

- GitHub Issues: [Report bugs](https://github.com/flessan/RECQR/issues)
- Email: support@recqr.com

---

Built with <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/heart.svg" width="16" height="16" align="top" /> using Next.js and Material Design 3
