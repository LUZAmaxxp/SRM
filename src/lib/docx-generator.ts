import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, WidthType, AlignmentType, ImageRun } from 'docx';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

export interface BaseReportData {
  _id?: string;
  employeeName: string;
  employeeId: string;
  siteName: string;
  stationName: string;
  description: string;
  priority: string;
  status: string;
  photoUrl?: string;
  recipientEmails: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InterventionData extends BaseReportData {
  interventionType: string;
}

export interface ReclamationData extends BaseReportData {
  reclamationType: string;
  date?: Date;
}

// Common function to create report details table
function createDetailsTable(data: BaseReportData & { type: string; typeValue: string }) {
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [
      createTableRow("ID:", data._id || ""),
      createTableRow("Nom D'Employee :", data.employeeName),
      createTableRow("Employee ID:", data.employeeId),
      createTableRow("Site:", data.siteName),
      createTableRow("Station :", data.stationName),
      createTableRow(`${data.type}:`, data.typeValue),
      createTableRow("Prioritée:", data.priority),
      createTableRow("Status:", data.status),
      createTableRow("Date Creation:", data.createdAt ? new Date(data.createdAt).toLocaleDateString() : new Date().toLocaleDateString()),
    ],
  });
}

// Helper function to create table rows
function createTableRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })],
      }),
      new TableCell({
        width: { size: 70, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: value })] })],
      }),
    ],
  });
}

// Helper function to create section headers
function createSectionHeader(text: string, spacingBefore = 400, spacingAfter = 200): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24,
      }),
    ],
    spacing: { before: spacingBefore, after: spacingAfter },
  });
}

// Helper function to create content paragraphs
function createContentParagraph(text: string, spacingAfter = 400): Paragraph[] {
  const lines = text.split('\n');
  const paragraphs: Paragraph[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const textRuns: TextRun[] = [];
    const parts = line.split(/(\*\*.*?\*\*)/g);

    for (const part of parts) {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Bold text
        const boldText = part.slice(2, -2);
        textRuns.push(new TextRun({
          text: boldText,
          bold: true,
          size: 22,
        }));
      } else {
        // Regular text
        textRuns.push(new TextRun({
          text: part,
          size: 22,
        }));
      }
    }

    paragraphs.push(new Paragraph({
      children: textRuns,
      spacing: { after: i === lines.length - 1 ? spacingAfter : 200 },
    }));
  }

  return paragraphs;
}

// Helper function to create report title
function createReportTitle(title: string | string[]): Paragraph[] {
  if (typeof title === 'string') {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 28,
            color: "374151",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      }),
    ];
  } else {
    return title.map((line, index) => new Paragraph({
      children: [
        new TextRun({
          text: line,
          bold: true,
          size: 28,
          color: "374151",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: index === title.length - 1 ? 600 : 200 },
    }));
  }
}

// Helper function to create photo section
function createPhotoSection(photoBuffer: Buffer | null): Paragraph[] {
  if (!photoBuffer) return [];

  return [
    createSectionHeader("Photo:"),
    new Paragraph({
      children: [
        new ImageRun({
          data: photoBuffer,
          transformation: {
            width: 400,
            height: 300,
          },
          type: "png",
        }),
      ],
      spacing: { after: 400 },
    }),
  ];
}

// Helper function to create logo paragraph
function createLogoParagraph(): Paragraph {
  const logoPath = path.join(process.cwd(), 'public', 'LOGO-SOUSS-MASSA-1033x308px-removebg-preview.png');
  const logoBuffer = fs.readFileSync(logoPath);

  return new Paragraph({
    children: [
      new ImageRun({
        data: logoBuffer,
        transformation: {
          width: 200,
          height: 60,
        },
        type: "png",
      }),
    ],
    alignment: AlignmentType.LEFT,
    spacing: { after: 200 },
  });
}

// Common function to generate report document - FIXED STRUCTURE
async function generateReportDoc(
  data: BaseReportData & { type: string; typeValue: string },
  reportTitle: string | string[],
): Promise<Buffer> {
  let photoBuffer: Buffer | null = null;

  try {
    if (data.photoUrl) {
      photoBuffer = await fetch(data.photoUrl).then(res => res.buffer());
    }
  } catch (error) {
    console.warn('Failed to fetch photo:', error);
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Logo
          createLogoParagraph(),
          
          // Title
          ...createReportTitle(reportTitle),

          // Report Details Table
          createDetailsTable(data),

          // Photo Section - Moved to be right after the table like in your DOCX files
          ...createPhotoSection(photoBuffer),

          // Report Recipients Section - Moved to be after photo like in your DOCX files
          createSectionHeader("Report Recipients:"),
          ...createContentParagraph(data.recipientEmails.join(", ")),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

export async function generateInterventionDoc(data: InterventionData): Promise<Buffer> {
  // Parse the description to extract team, dates, and company
  const description = data.description || '';

  // Extract team (look for "Team:" pattern)
  const teamMatch = description.match(/Team:\s*([^.]+)/i);
  const team = teamMatch ? teamMatch[1].trim() : '';

  // Extract dates (look for "Dates:" pattern)
  const datesMatch = description.match(/Dates:\s*([^.]+)/i);
  const dates = datesMatch ? datesMatch[1].trim() : '';

  // Extract company (look for "Company:" pattern)
  const companyMatch = description.match(/Company:\s*([^.]+)/i);
  const company = companyMatch ? companyMatch[1].trim() : '';

  // Create formatted description with bold labels
  const descriptionWithLabels = `**Intervention Par L'Equipe:** ${team}\n**Dates:** ${dates}\n**Entreprise:** ${company}`;

  return generateReportDoc(
    {
      ...data,
      type: "Intervention Type",
      typeValue: data.interventionType,
      description: descriptionWithLabels
    },
    "Intervention"
  );
}

export async function generateReclamationDoc(data: ReclamationData): Promise<Buffer> {
  // Create formatted description with form data
  const descriptionWithLabels = `**Type de Reclamation :** ${data.reclamationType}\n**Date:** ${data.date ? new Date(data.date).toLocaleDateString() : ''}\n**Nom de Station:** ${data.stationName}\n\n**Description:** ${data.description}`;

  return generateReportDoc(
    {
      ...data,
      type: "Reclamation Type",
      typeValue: data.reclamationType,
      description: descriptionWithLabels
    },
    "Reclamation"
  );
}