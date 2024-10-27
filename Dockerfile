FROM node:latest

COPY package.json package.json
COPY src/ src/
COPY tsconfig.json tsconfig.json

RUN apt-get update && apt-get install -y \
    build-essential \
    ffmpeg \
    && npm install

RUN mkdir -p node_modules/whisper-node/lib/whisper.cpp/models && \
    curl -L -o node_modules/whisper-node/lib/whisper.cpp/models/ggml-medium.bin \
    https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin?download=true



EXPOSE 3000

ENTRYPOINT ["npm", "start"]