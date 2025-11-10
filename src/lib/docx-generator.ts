import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, WidthType, AlignmentType, ImageRun } from 'docx';
import fetch from 'node-fetch';

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
}

// Common function to create report details table
function createDetailsTable(data: BaseReportData & { type: string; typeValue: string }) {
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [
      createTableRow("Employee Name:", data.employeeName),
      createTableRow("Employee ID:", data.employeeId),
      createTableRow("Site Name:", data.siteName),
      createTableRow("Station Name:", data.stationName),
      createTableRow(`${data.type}:`, data.typeValue),
      createTableRow("Priority:", data.priority),
      createTableRow("Status:", data.status),
      createTableRow("Date Created:", data.createdAt ? new Date(data.createdAt).toLocaleDateString() : new Date().toLocaleDateString()),
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
function createContentParagraph(text: string, spacingAfter = 400): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        size: 22,
      }),
    ],
    spacing: { after: spacingAfter },
  });
}

// Helper function to create main header
function createMainHeader(): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: "UTILITY FIRM",
        bold: true,
        size: 32,
        color: "1F2937",
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  });
}

// Helper function to create report title
function createReportTitle(title: string): Paragraph {
  return new Paragraph({
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
  });
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
        }),
      ],
      spacing: { after: 400 },
    }),
  ];
}

// Common function to generate report document
async function generateReportDoc(
  data: BaseReportData & { type: string; typeValue: string },
  reportTitle: string
): Promise<Buffer> {
  let photoBuffer: Buffer | null = null;
  
  try {
    if (data.photoUrl) {
      photoBuffer = await fetch(data.photoUrl).then(res => res.buffer());
    }
  } catch (error) {
    console.warn('Failed to fetch photo:', error);
    // Continue without the photo if there's an error
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header
          createMainHeader("UTILITY FIRM"),
          createReportTitle(reportTitle),

          // Report Details Table
          createDetailsTable(data),

          // Description Section
          createSectionHeader("Description:"),
          createContentParagraph(data.description),

          // Photo Section
          ...createPhotoSection(photoBuffer),

          // Recipients Section
          createSectionHeader("Report Recipients:"),
          createContentParagraph(data.recipientEmails.join(", ")),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

export async function generateInterventionDoc(data: InterventionData): Promise<Buffer> {
  return generateReportDoc(
    {
      ...data,
      type: "Intervention Type",
      typeValue: data.interventionType
    },
    "Intervention Report"
  );
}

export async function generateReclamationDoc(data: ReclamationData): Promise<Buffer> {
  return generateReportDoc(
    {
      ...data,
      type: "Reclamation Type", 
      typeValue: data.reclamationType
    },
    "Reclamation Report"
  );
}