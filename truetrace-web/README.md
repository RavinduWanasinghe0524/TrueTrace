# TrueTrace - Photo Authenticity Detection

**TrueTrace** is an AI-powered web application that detects photo manipulation and editing. Built by IronLogix, it helps users verify if photos are authentic or have been digitally altered.

## 🎯 What Does It Do?

TrueTrace analyzes photos using multiple detection methods to determine if they have been edited or manipulated:

- **Metadata Analysis** - Checks hidden photo information (camera, date, software)
- **Error Level Analysis (ELA)** - Detects compression inconsistencies
- **Noise Variance Detection** - Identifies unnatural noise patterns
- **AI Forensics** - Uses machine learning to spot sophisticated edits

## ✨ Features

- 🆓 **Completely Free** - No signup or payment required
- ⚡ **Fast Analysis** - Results in 3-10 seconds
- 🔒 **Privacy First** - Photos are not stored or saved
- 📱 **User Friendly** - Simple interface anyone can understand
- 🎯 **Confidence Scores** - Clear percentage-based results

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd truetrace-web
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
truetrace-web/
├── app/
│   ├── api/analyze/      # Image analysis API endpoint
│   ├── page.tsx          # Main page component
│   └── layout.tsx        # Root layout
├── components/
│   ├── Hero.tsx          # Landing section
│   ├── FileUpload.tsx    # Photo upload interface
│   ├── AnalysisResults.tsx  # Results display
│   ├── HowItWorks.tsx    # Explainer section
│   ├── FAQ.tsx           # Frequently asked questions
│   ├── Privacy.tsx       # Privacy information
│   └── LoadingScreen.tsx # Analysis loading state
├── lib/
│   ├── analyzer.ts       # Main analysis logic
│   ├── detectors/        # Detection algorithms
│   └── types.ts          # TypeScript types
└── public/               # Static assets
```

## 🔧 Technologies Used

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Sharp** - Image processing
- **EXIF Parser** - Metadata extraction

## 📊 How It Works

1. **Upload** - User uploads a JPEG or PNG image (max 10MB)
2. **Analysis** - Four detection methods run in parallel:
   - Metadata checker looks for tampering signs
   - ELA highlights compression inconsistencies
   - Noise detector finds unnatural patterns
   - AI forensics analyzes advanced manipulations
3. **Results** - Weighted confidence score (0-100%) determines verdict:
   - 70-100%: Photo is likely real ✅
   - 40-69%: Possible editing ⚠️
   - 0-39%: Clear signs of editing ❌

## 🔒 Privacy & Security

- Photos are analyzed in real-time and immediately deleted
- No user accounts or personal information required
- No data stored on servers
- Secure HTTPS connections
- Client-side processing where possible

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Detection Methods

1. Create a new detector in `lib/detectors/`
2. Import and call it in `lib/analyzer.ts`
3. Add appropriate weight to the scoring system

## 📝 License

This project is private and proprietary to IronLogix.

## 👥 About IronLogix

IronLogix specializes in AI-powered security and forensic tools. TrueTrace is designed to help individuals and organizations verify photo authenticity.

## 📞 Support

For questions or support:
- Email: support@ironlogix.com
- Website: [Your website URL]

## 🚧 Roadmap

- [ ] Video manipulation detection
- [ ] Batch processing
- [ ] API access
- [ ] Mobile app
- [ ] Advanced reporting features

---

**Note**: TrueTrace is a helpful detection tool but not a legal certification. For official forensic analysis, consult professional forensic experts.
