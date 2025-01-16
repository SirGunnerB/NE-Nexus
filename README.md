# NE Nexus

NE Nexus is an all-in-one recruitment platform that combines Applicant Tracking System (ATS), Customer Relationship Management (CRM), job board integration, and advanced hiring features into a powerful desktop application.

## Features

- Applicant Tracking System (ATS)
- Customer Relationship Management (CRM)
- Job Board Integration
- Video Interviewing
- Resume Parsing
- Scheduling Tools
- Background Checks
- Onboarding Management
- AI-Powered Job Matching
- Advanced Analytics
- Built-in SQLite Database

## Tech Stack

- Frontend: Electron + React
- Backend: Node.js + Express
- Database: SQLite (built into the application)
- ORM: Sequelize

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Git

### Installation

1. Clone the repository:
```bash
git clone git@github.com:SirGunnerB/NE-Nexus.git
cd NE-Nexus
```

2. Install dependencies:
```bash
npm install
cd client && npm install && cd ..
```

3. Start the development environment:
```bash
npm run dev
```

This will start:
- Electron application
- React development server
- Express backend server

The SQLite database will be automatically created in your application data directory when the application first runs.

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

ISC 