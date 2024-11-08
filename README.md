# BTC Doc Vault (Prototype | Proof of Concept)

## Overview
BTC Doc Vault is a secure document management system that leverages Bitcoin's blockchain technology to provide tamper-proof document storage and verification. This application allows users to store, manage, and protect their important documents using Bitcoin-based encryption and time-lock contracts.

<img width="1152" alt="8" src="https://github.com/user-attachments/assets/1b468ce7-5809-4e8e-b1f4-f7c5c296d55e">
<img width="1152" alt="1" src="https://github.com/user-attachments/assets/5dcb7009-7ebc-4562-bbe4-6d16a7117216">
<img width="1152" alt="6" src="https://github.com/user-attachments/assets/7c34bc82-4edd-4000-8c66-9f1dc5876337">
<img width="1152" alt="0" src="https://github.com/user-attachments/assets/ed0695d5-d290-4a51-a763-6499acdef26b">
<img width="1063" alt="61" src="https://github.com/user-attachments/assets/2039d22c-ed56-48d0-b003-4539533669e0">
<img width="1152" alt="5" src="https://github.com/user-attachments/assets/5ace96ab-6777-4556-9cf0-ab93f6a24ffa">
<img width="1152" alt="4" src="https://github.com/user-attachments/assets/13deabbb-980d-4db5-91c4-40db45da7966">
<img width="1152" alt="3" src="https://github.com/user-attachments/assets/e3be8f9b-d17c-48d5-b349-5db2cd0b801b">
<img width="1152" alt="2" src="https://github.com/user-attachments/assets/d8c35541-1bc8-44cc-a4ac-9e30d75715f3">


## Features
- **Secure Document Storage**: Upload and store documents with end-to-end encryption
- **Bitcoin Authentication**: Accounts are secured using a Bitcoin wallet 12-word randomized mnemonic seed and custom passphrase
- **Time-Lock Contracts**: Set time-based access controls for documents using Bitcoin smart contracts
- **Document Categories**: Organize documents with customizable categories
- **Search & Filter**: Easily find documents using search and filtering options
- **Bulk Operations**: Perform actions on multiple documents simultaneously
- **Preview Support**: Preview supported document types directly in the browser
- **Download Protection**: Secure document download with authentication
- **Responsive Design**: Works seamlessly across desktop and mobile devices

# Languages & Technologies in BTC Doc Vault

## Frontend
- **TypeScript** (Primary language)
- **JavaScript (ES6+)**
- **HTML5**
- **CSS3**
  - TailwindCSS for styling
  - CSS Modules for component-specific styles

## Backend
- **TypeScript** (Primary language)
- **JavaScript (ES6+)**
- **SQL** (for Supabase database queries)

## Database
- **MongoDB** (NoSQL)
  - MongoDB Query Language
- **PostgreSQL** (via Supabase)
  - SQL for database operations

## Smart Contracts
- **Bitcoin Script** (for time-lock contracts)

## Configuration
- **JSON** (package configuration, tsconfig)
- **YAML** (deployment configurations)
- **ENV** (environment variables)

## Testing
- **Jest** (JavaScript/TypeScript testing)
- **Cypress** (E2E testing)

## Documentation
- **Markdown** (README, documentation)
- **JSDoc** (code documentation)

## Version Control
- **Git** (version control)

## Package Management
- **NPM** (Node Package Manager)

## Build Tools
- **Webpack** (bundling)
- **Babel** (JavaScript compilation)
- **TypeScript Compiler**

## API
- **REST API**
- **JSON** (data format)

## Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Supabase Account
- Bitcoin Node (optional for full node functionality)


## Installation

### Backend Setup

bash
Navigate to backend directory
cd /Users/davidshapiro/Desktop/bitcoin-document-vault/backend
Install dependencies
npm install
Create .env file
cp .env.example .env
Update .env with your credentials
nano .env

### Frontend Setup

bash
Navigate to frontend directory
cd /Users/davidshapiro/Desktop/bitcoin-document-vault/frontend
Install dependencies
npm install
Create .env.local file
cp .env.example .env.local
Update .env.local with your credentials
nano .env.local



## Environment Variables

### Backend (.env)

plaintext
PORT=3001
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_secure_session_secret
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_ANON_KEY=your_supabase_anon_key



### Frontend (.env.local)

plaintext
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key



## Running the Application

### Development Mode

bash
Start backend server
cd backend
npm run dev
Start frontend server (in a new terminal)
cd frontend
npm run dev



### Production Mode

bash
Build and start backend
cd backend
npm run build
npm start
Build and start frontend
cd frontend
npm run build
npm start



## Security Features
- End-to-end encryption of documents
- Bitcoin wallet-based authentication
- Time-lock contracts for document access control
- Session-based authentication
- Rate limiting for API endpoints
- Secure file upload validation
- XSS and CSRF protection

## API Documentation
The API documentation is available at `/api-docs` when running the backend server.

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Support
For support, please open an issue in the GitHub repository or contact the development team.

## Acknowledgments
- Bitcoin Core Team
- Next.js Team
- Supabase Team
- MongoDB Team
- All contributors and supporters

## Disclaimer
This software is provided "as is", without warranty of any kind. Use at your own risk.

## Contact
David Shapiro - dshapiro789@gmail.com
Project Link: [[GitHub Repository URL]](https://github.com/dshapiro789/bitcoin-document-vault)


