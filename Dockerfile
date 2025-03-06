FROM node:14.15 as build 
WORKDIR /app
COPY package*.json ./
RUN npm install --force
COPY . .
# Install serve globally
RUN npm install -g serve
# Build the Angular application
RUN npm run build
EXPOSE 4200
# Serve the application.
CMD ["serve", "-s", "dist/coreui-free-angular-admin-template", "-l", "4200"]