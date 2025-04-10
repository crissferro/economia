# Usa una imagen base de Node.js
FROM node:18-slim

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Define environment variable
ENV NODE_ENV production

# Copia el resto de los archivos de la aplicación
COPY . .

# Expone el puerto que usa tu aplicación (asumiendo que es el 3000, cámbialo si es otro)
EXPOSE 8080

# Comando para iniciar la aplicación
CMD ["node", "index.js"]
