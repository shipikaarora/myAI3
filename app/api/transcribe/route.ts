import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await client.audio.transcriptions.create({
      file: buffer,              // ← FIX: pass buffer directly
      model: "gpt-4o-mini-tts",  // whisper successor
      response_format: "text",
    });

    return NextResponse.json({ text: result });
  } catch (err: any) {
    console.error("Transcription error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
