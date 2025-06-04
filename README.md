# Sweldomo Automation

## Pre-requisites

1. Node >= 20.18.1
2. Typescript >= 5.4

## Resources

- [Playwright](https://playwright.dev)

## Getting Started

#### Step 1: Initial Setup

- Clone the repository: `git clone git@github.com:Ming-desu/sweldomo-automation.git`
- Navigate: `cd sweldomo-automation`
- Install dependencies: `npm install`
- Install playwright: 
  ```
  # Linux (wsl)
  npx playwright install --with-deps

  # Windows
  npx playwright install chromium
  ```

#### Step 2: Environment Configuration

- Create `.env`: Copy `.env.template` to `.env`
- Update `.env`: Fill in necessary environment variables

#### Step 3: Running the Project

- Development Mode: `npm start`
- Building: `npm build`
