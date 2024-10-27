# Transcription and Summary Service

This project provides a service for uploading audio files, generating transcriptions, summaries, and tags, and then sending the processed data to a backend server.

## Project Structure

The project consists of the following main components:

- `src/`: Contains the source code of the application.
    - `index.ts`: The main entry point of the application, setting up the Express server and handling file uploads.
    - `transcriber.ts`: Contains the logic for adding files to the transcription queue.
    - `ollama.ts`: Contains the logic for interacting with the Ollama service.
    - `backendConnector.ts`: Contains the logic for sending processed data to the backend server.
- `.env`: Environment variables configuration file.
- `Dockerfile`: Docker configuration for containerizing the application.
- `uploads/`: Directory where uploaded files are temporarily stored.

## Environment variables

- `OLLAMA_BASE_URL`: Base URL for the Ollama service (e.g., `http://localhost:11434`)
- `OLLAMA_MODEL`: Model name for Ollama (e.g., `llama3.2`)
- `BACKEND_BASE_URL`: Base URL for the backend server