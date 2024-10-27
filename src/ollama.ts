import Queue from "./queue";
import { Ollama } from 'ollama';
import { Response } from './backendConnecter';
import { addToQueue as addToBackendQueue } from './backendConnecter';

let queue: Queue<Transcription> = new Queue();
let isWorkerRunning: boolean = false;
let ollama: Ollama;

interface Transcription {
    transcription: string;
    file: string;
}

export function addToQueue(transcription: Transcription): void {
    if (!ollama) {
        initOllama();
    }

    if (!process.env.OLLAMA_MODEL) {
        throw new Error('OLLAMA_MODEL environment variable is required');
    }

    queue.enqueue(transcription);
    if (!isWorkerRunning) {
        startWorker();
    }
    isWorkerRunning = false;
}

function startWorker(): void {
    isWorkerRunning = true;
    worker();
}

async function worker(): Promise<void> {
    while (!queue.isEmpty()) {
        const content = queue.dequeue()!;

        //gen title
        const title = await ollama.chat({
            model: process.env.OLLAMA_MODEL!,
            messages: [{role: 'user', content: "Bitte geben Sie mir nur einen kurzen Titel für diese Transkription: " + content.transcription}]
        })

        //gen summary
        const summary = await ollama.chat({
            model: process.env.OLLAMA_MODEL!,
            messages: [{role: 'user', content: "Bitte geben Sie mir eine Zusammenfassung für diese Transkription: " + content.transcription}]
        })

        //gen short summary
        const shortSummary = await ollama.chat({
            model: process.env.OLLAMA_MODEL!,
            messages: [{role: 'user', content: "Bitte geben Sie mir eine kurze Zusammenfassung für diese Transkription: " + content.transcription}]
        })

        //gen tags
        const tags = await ollama.chat({
            model: process.env.OLLAMA_MODEL!,
            messages: [{role: 'user', content: "Bitte geben Sie mir nur eine durch Kommas getrennte Liste von Tags für diese Transkription: " + content.transcription}]
        })

        const response: Response = {
            title: title.message.content,
            summary: summary.message.content,
            shortSummary: shortSummary.message.content,
            tags: tags.message.content.split(', '),
            file: content.file
        }

        console.log(response);
        addToBackendQueue(response);

    }
}

function initOllama() {
    if (!process.env.OLLAMA_BASE_URL) {
        throw new Error('OLLAMA_BASE_URL environment variable is required');
    }

    ollama = new Ollama({host: process.env.OLLAMA_BASE_URL});
}