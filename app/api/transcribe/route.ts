export const runtime = "nodejs";

import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audio = formData.get("file") as File;

    if (!audio) {
      return NextResponse.json({ error: "No audio file uploaded" }, { status: 400 });
    }

    // Convert uploaded File → ArrayBuffer → Buffer
    const arrayBuffer = await audio.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a Node.js File object that OpenAI accepts
    const nodeFile = new File([buffer], "speech.webm", { type: "audio/webm" });

    const transcript = await client.audio.transcriptions.create({
      file: nodeFile,
      model: "gpt-4o-mini-tts", 
      response_format: "text",
    });

    return NextResponse.json({ text: transcript }, { status: 200 });
  } catch (err: any) {
    console.error("Transcription error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
