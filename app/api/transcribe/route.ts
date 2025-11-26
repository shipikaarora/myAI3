import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No audio file found" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await client.audio.transcriptions.create({
      file: {
        name: "audio.webm",
        data: buffer,
      },
      model: "gpt-4o-mini-tts",
      response_format: "text",
    });

    return NextResponse.json({ text: result });
  } catch (error: any) {
    console.error("Transcription error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
