import { NextResponse } from 'next/server';
import { processUploadedDocument } from '@/lib/storage/file-handler';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'resume' | 'transcript';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!type || (type !== 'resume' && type !== 'transcript')) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "resume" or "transcript"' },
        { status: 400 }
      );
    }
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Process file (extract text and save)
    const folder = type === 'resume' ? 'resumes' : 'transcripts';
    const result = await processUploadedDocument(
      buffer,
      file.name,
      folder
    );
    
    return NextResponse.json({
      text: result.text,
      url: result.url,
      filename: file.name,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
