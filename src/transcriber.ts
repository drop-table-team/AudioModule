import path from "path";
import Queue from "./queue";
// @ts-ignore
import whisper from 'whisper-node';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { addToQueue as addToOllamaQueue } from './ollama';

let queue: Queue<Express.Multer.File> = new Queue();
let isWorkerRunning: boolean = false;


export function addToQueue(file: Express.Multer.File): void {
    queue.enqueue(file);
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
        const file = queue.dequeue()!;
        const filePath = file.path;
        console.log(filePath)
        const outputFilePath = path.join('uploads', `${path.parse(file.filename).name}.wav`);

        ffmpeg(filePath)
            .toFormat('wav')
            .audioFrequency(16000)
            .on('end', async () => {
                console.log('File converted successfully');
                try {
                    let transcription = await whisper(outputFilePath, {modelName: 'base'});
                    let content = transcription.map((t: any) => t.speech).join(' ');
                    addToOllamaQueue({transcription: content, file: outputFilePath});
                } catch (error) {
                    console.error('Error transcribing file:', error);
                } finally {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error('Error deleting file:', err);
                    });
                }
            })
            .on('error', (err) => {
                console.log('An error occurred: ' + err.message);
            })
            .save(outputFilePath);
    }
}