# Token Airdrop Application

A decentralized application for distributing ERC20 tokens to multiple recipients in a single transaction. This application allows users to airdrop tokens to multiple addresses while managing token allowances efficiently.

## Features

- Distribute ERC20 tokens to multiple recipients in one transaction
- Automatic allowance checking and management
- Support for Sepolia testnet and local Anvil development
- User-friendly interface for inputting recipient addresses and amounts
- Real-time validation of token allowances and balances

## Project Structure

### Constants (`src/constants.ts`)

- Contains ABIs for ERC20 and airdrop contracts
- Configuration for supported networks (Sepolia and Anvil)
- Contract addresses for the airdrop sender (token distributor)

### Main Components

- `AirdropForm`: The primary component that handles:
  - Token address input
  - Recipient address list
  - Amount per recipient
  - Allowance verification
  - Transaction submission

### Server Actions (`src/app/actions.ts`)

- Handles the server-side logic for token distribution
- Validates input data
- Manages transaction execution

## Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- Anvil (for local development)

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev

# Run Anvil with saved state
npm run anvil
```

> **Note:** The `npm run anvil` script uses `airdrop-deploy.json` which contains a saved state for locally running Anvil. This state includes pre-deployed mock tokens that are distributed to Anvil's default accounts. The mock token contract is deployed at address `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Available Scripts

- `npm run dev`: Start the Next.js development server
- `npm run anvil`: Launch Anvil with saved state for local development
- `npm run build`: Build the application for production
- `npm run start`: Start the production server
- `npm run lint`: Run ESLint for code quality checks

## Supported Networks

Currently, the application supports:

- Sepolia Testnet
- Local Anvil Network

More networks will be added in future updates.

## Technical Details

### Token Allowance System

The application implements a robust allowance checking system that:

1. Verifies the user's token balance
2. Checks existing allowances for the airdrop contract
3. Ensures sufficient allowance before proceeding with the airdrop

### Contract Integration

- Uses the ERC20 standard interface for token interactions
- Implements a custom airdrop contract for efficient token distribution
- Supports gas-efficient batch transfers

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

TODO

1. Finish tests
2. add more networks
