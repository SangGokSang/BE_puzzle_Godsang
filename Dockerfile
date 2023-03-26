# Base image
FROM node:18

# Working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm" ,"run","start:prod"]