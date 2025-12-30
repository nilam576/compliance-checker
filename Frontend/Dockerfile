FROM node:18

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app code
COPY . .

# Set build-time environment variables
ARG NEXT_PUBLIC_API_URL=https://reglex-backend-305534435339.us-central1.run.app
ARG NEXT_PUBLIC_USE_MOCK_API=false
ARG NEXT_PUBLIC_SKIP_AUTH=true
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_USE_MOCK_API=$NEXT_PUBLIC_USE_MOCK_API
ENV NEXT_PUBLIC_SKIP_AUTH=$NEXT_PUBLIC_SKIP_AUTH

# Build Next.js with environment variables
RUN npm run build

# Expose port and start
# Cloud Run will set PORT=8080, but we still expose 3000 for flexibility
EXPOSE 8080
CMD ["sh", "-c", "npm start -- -p ${PORT:-3000}"]
