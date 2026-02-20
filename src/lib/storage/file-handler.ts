/**
 * File handling utilities for resume and transcript uploads
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

import mammoth from 'mammoth';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ExtractedFile {
  text: string;
  filename: string;
  size: number;
}

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract text from DOCX file
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

/**
 * Extract text from file based on type
 */
export async function extractTextFromFile(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const ext = path.extname(filename).toLowerCase();
  
  if (ext === '.pdf') {
    return extractTextFromPDF(buffer);
  } else if (ext === '.docx') {
    return extractTextFromDOCX(buffer);
  } else if (ext === '.txt') {
    return buffer.toString('utf-8');
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }
}

/**
 * Save uploaded file to local storage
 */
export async function saveUploadedFile(
  buffer: Buffer,
  filename: string,
  folder: 'resumes' | 'transcripts'
): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'uploads', folder);
  
  // Ensure directory exists
  await fs.mkdir(uploadsDir, { recursive: true });
  
  // Generate unique filename
  const timestamp = Date.now();
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);
  const uniqueFilename = `${basename}-${timestamp}${ext}`;
  
  const filepath = path.join(uploadsDir, uniqueFilename);
  
  // Save file
  await fs.writeFile(filepath, buffer);
  
  // Return relative URL
  return `/uploads/${folder}/${uniqueFilename}`;
}

/**
 * Process uploaded document (extract text and save file)
 */
export async function processUploadedDocument(
  buffer: Buffer,
  filename: string,
  folder: 'resumes' | 'transcripts'
): Promise<{ text: string; url: string }> {
  // Extract text
  const text = await extractTextFromFile(buffer, filename);
  
  // Save file
  const url = await saveUploadedFile(buffer, filename, folder);
  
  return { text, url };
}
