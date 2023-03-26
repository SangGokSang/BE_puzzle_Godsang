# Base image
FROM node:18

# Working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm","run" ,"start:prod"]