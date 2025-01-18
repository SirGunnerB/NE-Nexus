# NE-Nexus: Desktop Recruitment Platform

A modern desktop application for managing job postings and applications, built with Electron, React, and Express.

## Features

- 🔒 Secure authentication and user management
- 💼 Job posting creation and management
- 📝 Application tracking system
- 👥 Candidate profile management
- 📧 Email notifications
- 🌓 Dark/Light theme support
- 🔄 Offline-first capability
- 🚀 Cross-platform support (Windows, macOS, Linux)

## Prerequisites

- Node.js 18.x
- npm or yarn
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/SirGunnerB/NE-Nexus.git
cd NE-Nexus
```

2. Install dependencies:
```bash
npm install
cd client && npm install && cd ..
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Update the environment variables in `.env` with your configuration.

## Development

Start the application in development mode:

```bash
npm run dev
```

This will start:
- The Electron application
- React development server
- Express API server

## Building

Build the application for production:

```bash
npm run build
npm run package
```

The packaged application will be available in the `dist` directory.

## Testing

Run the test suite:

```bash
npm test
```

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:
1. Check the [FAQ](docs/FAQ.md)
2. Search through [existing issues](https://github.com/SirGunnerB/NE-Nexus/issues)
3. Open a new issue if needed

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI powered by [React](https://reactjs.org/)
- Backend API with [Express](https://expressjs.com/)
- Database management using [Sequelize](https://sequelize.org/) 