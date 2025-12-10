# 🌊 ShiftStream

> **The Agentic Settlement Layer for Crypto Commerce**

Built for the [SideShift.ai Buildathon](https://sideshift.ai/buildathon) 🏆

## 🎯 What is ShiftStream?

ShiftStream is an **AI-powered payment infrastructure** that creates Smart Payment Links where funds automatically settle into AI-controlled Smart Accounts. It combines:

- **SideShift.ai** - Accept 100+ cryptocurrencies, auto-convert to USDC
- **ZeroDev Smart Accounts** - Gasless, programmable wallets on Base
- **AI Agent** - Autonomous verification and fund release

## ✨ Features

### 🔗 Smart Payment Links
Three types of payment flows:

| Type | Description | Use Case |
|------|-------------|----------|
| **Direct** | Instant settlement | Simple payments, tips |
| **Escrow** | Conditional release | Freelance, commerce |
| **Split** | Multi-recipient | Revenue sharing, royalties |

### 🤖 AI Agent Capabilities
- Monitor SideShift deposits in real-time
- Verify delivery conditions for escrow release
- Auto-execute fund transfers via Session Keys
- Natural language interaction

### 💨 Gas-Free Transactions
All operations are sponsored via ZeroDev Paymaster. Users never pay gas.

### 🔐 Session Key Automation
AI Agent uses time-limited session keys to execute transactions on behalf of users.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        ShiftStream                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Payer     │───▶│  SideShift  │───▶│   Smart     │     │
│  │  (Any Coin) │    │  (Convert)  │    │   Account   │     │
│  └─────────────┘    └─────────────┘    └──────┬──────┘     │
│                                               │             │
│                     ┌─────────────┐           │             │
│                     │  AI Agent   │◀──────────┘             │
│                     │  (Verify &  │                         │
│                     │   Execute)  │                         │
│                     └──────┬──────┘                         │
│                            │                                │
│              ┌─────────────┼─────────────┐                  │
│              ▼             ▼             ▼                  │
│         ┌────────┐   ┌────────┐   ┌────────────┐           │
│         │ Direct │   │ Escrow │   │   Split    │           │
│         │Release │   │Release │   │Distribution│           │
│         └────────┘   └────────┘   └────────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- [Supabase Account](https://supabase.com) (free tier works)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/shiftstream.git
cd shiftstream

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

```env
# ZeroDev (Get from https://dashboard.zerodev.app)
NEXT_PUBLIC_ZERODEV_PROJECT_ID=your-project-id
NEXT_PUBLIC_BUNDLER_RPC=https://rpc.zerodev.app/api/v2/bundler/your-project-id
NEXT_PUBLIC_PAYMASTER_RPC=https://rpc.zerodev.app/api/v2/paymaster/your-project-id

# Groq AI (Get from https://console.groq.com)
GROQ_API_KEY=your-groq-api-key

# SideShift (Get from https://sideshift.ai/affiliates)
NEXT_PUBLIC_SIDESHIFT_AFFILIATE_ID=your-affiliate-id
SIDESHIFT_SECRET_KEY=your-secret-key

# Supabase (Get from https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Chain
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_CHAIN_NAME=base
```

### Database Setup

1. Create a new Supabase project
2. Go to SQL Editor
3. Run the schema from `supabase/schema.sql`

## 📱 Usage

### 1. Create Smart Account
Click "Create Smart Account" to generate a counterfactual address on Base. No gas required!

### 2. Create Smart Link
Choose your link type:
- **Direct**: Funds go straight to your wallet
- **Escrow**: Funds held until condition met (e.g., delivery)
- **Split**: Funds distributed to multiple recipients

### 3. Share Payment Link
Copy and share the generated payment link. Payers can send BTC, ETH, SOL, or 100+ other coins.

### 4. Automatic Settlement
- **Direct**: Funds auto-release on deposit
- **Escrow**: AI Agent verifies condition, then releases
- **Split**: Funds distributed per configuration

## 🧪 Demo Scenarios

### Test Escrow Release
1. Create an Escrow link with tracking number condition
2. Tell the AI Agent: "Check delivery for WIN123456"
3. Agent verifies delivery and releases funds

### Test Split Distribution
1. Create a Split link with multiple recipients
2. Make a payment to the deposit address
3. Watch funds auto-distribute

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| ZeroDev SDK | Smart Accounts & Session Keys |
| Vercel AI SDK | AI Agent integration |
| Groq | LLM (Llama 3.3 70B) |
| SideShift API | Multi-coin swaps |
| Supabase | Database & Auth |
| Base Chain | L2 for settlement |

## 📁 Project Structure

```
shiftstream/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── agent/      # AI Agent endpoint
│   │   │   ├── links/      # Smart Links CRUD
│   │   │   ├── shift/      # SideShift proxy
│   │   │   └── webhook/    # SideShift webhooks
│   │   ├── dashboard/      # Main dashboard
│   │   ├── pay/            # Payment page
│   │   └── page.tsx        # Landing page
│   ├── components/
│   │   ├── features/       # Feature components
│   │   ├── landing/        # Landing page sections
│   │   └── ui/             # Reusable UI components
│   └── lib/
│       ├── constants.ts    # App constants
│       ├── sideshift.ts    # SideShift client
│       ├── store.ts        # Zustand store
│       ├── supabase.ts     # Supabase client
│       ├── types.ts        # TypeScript types
│       ├── utils.ts        # Utilities
│       └── zerodev.ts      # ZeroDev client
├── supabase/
│   └── schema.sql          # Database schema
└── public/                 # Static assets
```

## 🔒 Security

- Private keys stored locally (browser localStorage)
- Session keys have time-limited validity
- Server-side API routes protect secret keys
- Webhook signature verification (production)

## 🗺️ Roadmap

- [ ] Webhook signature verification
- [ ] Multi-chain support (Polygon, Arbitrum)
- [ ] Time-based escrow conditions
- [ ] Recurring payment links
- [ ] Invoice generation
- [ ] Mobile app

## 🤝 Contributing

PRs welcome! Please open an issue first for major changes.

## 📄 License

MIT License

## 🙏 Acknowledgments

- [SideShift.ai](https://sideshift.ai) - For the amazing swap API
- [ZeroDev](https://zerodev.app) - For Smart Account infrastructure
- [Groq](https://groq.com) - For fast AI inference
- [Vercel](https://vercel.com) - For hosting & AI SDK

---

**Built with ❤️ for the SideShift.ai Buildathon**
