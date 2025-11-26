export const runtime = "nodejs";

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { toFile } from "openai/uploads";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    // Convert Next.js File → Node Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert Buffer → Uploadable file the SDK accepts
    const uploadableFile = await toFile(buffer, "audio.webm");

    // OpenAI speech-to-text
    const transcript = await client.audio.transcriptions.create({
      file: uploadableFile,
      model: "gpt-4o-mini-tts",
      response_format: "text",
    });

    return NextResponse.json({ text: transcript }, { status: 200 });
  } catch (err: any) {
    console.error("Transcription Route Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
