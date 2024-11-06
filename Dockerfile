# Stage 1: Build Stage
FROM node:20.11.1 AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install all dependencies, including dev dependencies
RUN npm install
RUN npm install -g nodemon
# Copy the rest of the application code
COPY . .

# Build the TypeScript files
RUN npm run build

# Stage 2: Production Stage
FROM node:20.11.1

# Set working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm install --only=production
RUN npm install -g nodemon

# Copy the built application from the previous stage
COPY --from=build /app/dist /app/dist

# Set NODE_ENV to production
ENV NODE_ENV=production

# Expose the application port
EXPOSE 5500

# Start the application
CMD ["node", "-r", "module-alias/register", "./dist", "--env=production"]
