import Queue from "./queue";
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export interface Response {
    title: string;
    summary: string;
    shortSummary: string;
    tags: string[];
    file: string;
}

let queue: Queue<Response> = new Queue();
let isWorkerRunning: boolean = false;

export function addToQueue(response: Response): void {
    if (!process.env.BACKEND_BASE_URL) {
        throw new Error('BACKEND_BASE_URL environment variable is required');
    }

    queue.enqueue(response);
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
        const response = queue.dequeue()!;

        const form = new FormData();
        const jsonPayload = JSON.stringify({
            title: response.title,
            tags: response.tags,
            short: response.shortSummary,
            transcription: response.summary
        });
        form.append('json', jsonPayload, { contentType: 'application/json' });

        form.append('file', fs.createReadStream(response.file), { contentType: 'audio/wav' });
        try {
            const response = await axios.post(process.env.BACKEND_BASE_URL! + "/modules/input", form, {
                headers: {
                    ...form.getHeaders()
                }
            });
            console.log(response.data);
        } catch (error) {
            console.error('Error making multipart POST request:', error);
        }
    }
}