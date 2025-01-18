# NE Nexus - Modern Recruitment Platform

A modern, feature-rich recruitment platform built with React, Node.js, and Material-UI. NE Nexus provides a seamless experience for both recruiters and job seekers with a beautiful, responsive UI and powerful features.

## Features

### For Recruiters
- **Job Management**: Create, edit, and manage job postings with rich details
- **Candidate Tracking**: Review applications and track candidate progress
- **Analytics Dashboard**: Get insights into job performance and recruitment metrics
- **Customizable Workflow**: Define custom recruitment stages and processes

### For Job Seekers
- **Smart Job Search**: Find relevant jobs with advanced filters and search
- **Easy Applications**: Apply to jobs with a streamlined application process
- **Application Tracking**: Monitor application status and updates
- **Profile Management**: Maintain professional profile and resume

## Technical Features
- 🎨 Modern UI with Material-UI components
- 🌓 Light/Dark theme support
- 🎯 Responsive design for all devices
- 🔒 Secure authentication and authorization
- 📊 Real-time notifications
- 🚀 Optimized performance
- 🔍 Advanced search and filtering
- 📱 Progressive Web App (PWA) support

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- SQLite (for development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SirGunnerB/NE-Nexus.git
cd NE-Nexus
```

2. Install dependencies:
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
```

3. Create environment files:
```bash
# In root directory
cp .env.example .env

# In client directory
cd client
cp .env.example .env
```

4. Start the development servers:
```bash
# Start both client and server in development mode
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
NE-Nexus/
├── client/                 # React frontend
│   ├── public/            # Static files
│   └── src/
│       ├── components/    # Reusable components
│       ├── hooks/         # Custom React hooks
│       ├── pages/         # Page components
│       ├── theme/         # Theme configuration
│       └── utils/         # Utility functions
├── config/                # Server configuration
├── models/                # Database models
├── routes/                # API routes
├── middleware/            # Custom middleware
└── server.js             # Express server
```

## Available Scripts

### Root Directory
- `npm run dev`: Start both client and server in development mode
- `npm run server`: Start server with nodemon
- `npm run client`: Start React development server
- `npm run build`: Build the client for production
- `npm start`: Start production server

### Client Directory
- `npm start`: Start development server
- `npm run build`: Build for production
- `npm test`: Run tests
- `npm run eject`: Eject from Create React App

## Environment Variables

### Server (.env)
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Material-UI for the amazing component library
- React team for the awesome framework
- All contributors who have helped shape this project 