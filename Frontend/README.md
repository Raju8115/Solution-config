# File 1: Frontend README.md

```markdown
# Solution Configurator - Frontend

React.js frontend application for the Solution Configurator tool.


## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Access to the backend API

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.ibm.com/expert-labs-solution-tool/solution-configurator-frontend.git
cd solution-configurator-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory of the project:

```bash
touch .env
```

Add the following environment variable:

```env
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```

**Note:** Update the `REACT_APP_API_BASE_URL` value based on your backend deployment environment:
- Local Development: `http://localhost:8000/api/v1`


### 4. Run the Application

**Development Mode:**
```bash
npm start
# or
yarn start
```