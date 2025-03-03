# Use the official Node.js image as a base
FROM node:22

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Install TypeScript globally
RUN npm install -g typescript

# Build the TypeScript code
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Command to run your app
CMD ["node", "dist/app.js"] 