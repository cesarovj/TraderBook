# TraderBook

A trading analytics dashboard for Sierra Chart users. Import your Trade Activity Log exports and get instant performance metrics — P&L, win rate, profit factor, drawdown, and more — across a chart, calendar heatmap, and detailed trade table.

## Features

- Drag-and-drop import of Sierra Chart `.txt` tab-separated trade logs
- Cumulative P&L chart and monthly calendar heatmap
- Key metrics: net P&L, win rate, profit factor, avg win/loss, max drawdown, avg duration
- Full trade table with entry/exit times, prices, quantity, and direction
- Supports futures contracts (MES, ES, NQ, MNQ, RTY, YM, MYM) with correct multipliers

## Tech stack

- **Frontend** — Next.js 16, React 19, Tailwind CSS, Recharts
- **Backend** — Node.js, Express, MongoDB (via Mongoose)

## Running locally

### Prerequisites

- Node.js 20+
- MongoDB running locally (`mongod`) or a MongoDB Atlas connection string

### 1. Clone the repo

```bash
git clone https://github.com/cesarovj/TraderBook.git
cd TraderBook
```

### 2. Start the frontend

```bash
npm install
cp .env.local.example .env.local   # or create .env.local manually
npm run dev
```

`.env.local` needs one variable:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

The app runs at **http://localhost:3000**.

### 3. Start the backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

`.env` defaults work out of the box for a local MongoDB instance:

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/traderbook
CLIENT_URL=http://localhost:3000
```

The server runs at **http://localhost:3001**.

### 4. Import a trade log

1. Open Sierra Chart → Trade Activity Log
2. **File → Save / Export Trade Activity Log** — save as `.txt`
3. Drop the file onto the dashboard or click **Import Log**

The app remembers every import by file hash, so re-uploading the same file has no effect.

## Project structure

```
TraderBook/
├── src/
│   ├── app/
│   │   └── page.tsx          # Main dashboard page
│   ├── components/
│   │   ├── CalendarView.tsx  # Monthly P&L heatmap
│   │   ├── FileUpload.tsx    # Drag-and-drop uploader
│   │   ├── MetricCard.tsx    # Stat card
│   │   ├── PnLChart.tsx      # Cumulative P&L area chart
│   │   └── TradeTable.tsx    # Trade list
│   └── lib/
│       ├── api.ts            # Backend API client
│       ├── calculateMetrics.ts
│       ├── parseTradeLog.ts  # Sierra Chart TSV parser
│       └── types.ts
└── server/
    └── src/
        ├── index.js          # Express entry point
        ├── db.js             # MongoDB connection
        ├── models/
        │   ├── Import.js     # Import record (filename, hash)
        │   └── Trade.js      # Individual trade document
        └── routes/
            └── imports.js    # REST API routes
```
