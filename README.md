# Security Risk Checker

## Overview

Security Risk Checker is a comprehensive web application designed to identify various security vulnerabilities and information leaks directly in your browser. Built with modern web technologies like Next.js, TypeScript, and Tailwind CSS, the application ensures a clean, responsive, and user-friendly interface.

## Features

- **IP Leak Testing**: Detect and display your public IPv4 and IPv6 addresses, geolocation data, and RDAP information.
- **DNS Leak Testing**: Check for DNS leaks by comparing responses from multiple DNS servers.
- **WebRTC Leak Testing**: Identify potential WebRTC-related privacy issues and exposed network configurations.
- **Geolocation Testing**: Test browser geolocation API access and accuracy.
- **Interactive UI**: Clean, responsive interface with expandable information panels.
- **Docker Support**: Ready-to-use containerized deployment.

## Demo

You can try the live demo of the application at: [https://leak-check.shariat.de/](https://leak-check.shariat.de/)

## Tech Stack

- [Next.js 15.1](https://nextjs.org/) – React framework for server-side rendering and static site generation.
- [TypeScript](https://www.typescriptlang.org/) – For static type checking.
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework for styling.
- [React Icons](https://react-icons.github.io/react-icons/) – Collection of customizable icons.
- [Leaflet](https://leafletjs.com/) – Interactive maps for geolocation testing.
- [Docker](https://www.docker.com/) – Simplifies containerized deployment.

## Getting Started

### Prerequisites

Ensure the following are installed on your system:

- Node.js (version 18 or later)
- npm or yarn
- Docker (optional, for containerized deployment)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/security-risk-checker.git
   cd security-risk-checker
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Deployment

1. Build the Docker image:

   ```bash
   docker compose build
   ```

2. Run the container:

   ```bash
   docker compose up -d
   ```

3. Access the application at [http://localhost:3000](http://localhost:3000).

## Project Structure

The project follows the Next.js 13+ app directory structure:

- **`app`** – Main Next.js application directory.
- **`components`** – Reusable React components.
- **`dns-leaks`** – Functionality for DNS leak testing.
- **`ip-leaks`** – Functionality for IP leak testing.
- **`webrtc-leaks`** – Functionality for WebRTC leak testing.
- **`geo-location`** – Functionality for geolocation testing.
- **`utils`** – Utility functions and API helpers.
- **`public`** – Static assets like images and icons.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Commit your changes:

   ```bash
   git commit -m "Add your feature"
   ```

4. Push to the branch:

   ```bash
   git push origin feature/your-feature-name
   ```

5. Open a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Author

Developed by Payam Shariat. [Visit my website](https://shariat.de) for more projects.

## Acknowledgments

- Flag icons provided by [flagcdn.com](https://flagcdn.com).
- IP geolocation data from various public APIs.
- DNS testing endpoints from multiple providers.
