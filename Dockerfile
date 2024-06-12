# Gunakan image Node.js sebagai base image
FROM node:14

# Tetapkan direktori kerja di dalam container
WORKDIR usr/src/app

# Salin file package.json dan package-lock.json ke direktori kerja
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin seluruh kode aplikasi ke dalam container
COPY . .

# Expose port aplikasi (gunakan 8080 untuk Cloud Run)
EXPOSE 8080

# Tentukan perintah untuk menjalankan aplikasi
CMD [ "node", "./server.js" ]