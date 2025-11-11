import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, WidthType, AlignmentType, ImageRun, BorderStyle } from 'docx';
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

// Professional color scheme
const COLORS = {
  PRIMARY: '2C5FAA',
  SECONDARY: '374151',
  ACCENT: '1E40AF',
  LIGHT_GRAY: 'F8FAFC',
  BORDER: 'E5E7EB'
};

// Common function to create report details table with professional styling
function createDetailsTable(data: BaseReportData & { type: string; typeValue: string }) {
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER },
      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER },
      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER },
    },
    rows: [
      createTableRow("Référence:", data._id || "N/A", true),
      createTableRow("Nom de l'Employé:", data.employeeName),
      createTableRow("Matricule:", data.employeeId),
      createTableRow("Site:", data.siteName),
      createTableRow("Station:", data.stationName),
      createTableRow(`${data.type}:`, data.typeValue),
      createTableRow("Priorité:", getPriorityText(data.priority)),
      createTableRow("Statut:", getStatusText(data.status)),
      createTableRow("Date de Création:", data.createdAt ? 
        new Date(data.createdAt).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : 
        new Date().toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })),
    ],
  });
}

// Helper function to get priority text in French
function getPriorityText(priority: string): string {
  const priorityMap: { [key: string]: string } = {
    'Low': 'Basse',
    'Medium': 'Moyenne',
    'High': 'Élevée',
    'Critical': 'Critique'
  };
  return priorityMap[priority] || priority;
}

// Helper function to get status text in French
function getStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    'Pending': 'En Attente',
    'In Progress': 'En Cours',
    'Completed': 'Terminé',
    'Cancelled': 'Annulé'
  };
  return statusMap[status] || status;
}

// Helper function to create table rows with professional styling
function createTableRow(label: string, value: string, isHeader = false): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 35, type: WidthType.PERCENTAGE },
        shading: {
          fill: isHeader ? COLORS.PRIMARY : COLORS.LIGHT_GRAY,
        },
        children: [new Paragraph({
          children: [new TextRun({ 
            text: label, 
            bold: true, 
            color: isHeader ? 'FFFFFF' : COLORS.SECONDARY,
            size: 22,
          })],
          alignment: AlignmentType.LEFT,
        })],
      }),
      new TableCell({
        width: { size: 65, type: WidthType.PERCENTAGE },
        children: [new Paragraph({
          children: [new TextRun({ 
            text: value, 
            color: COLORS.SECONDARY,
            size: 22,
          })],
          alignment: AlignmentType.LEFT,
        })],
      }),
    ],
  });
}

// Helper function to create section headers with professional styling
function createSectionHeader(text: string, spacingBefore = 400, spacingAfter = 200): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24,
        color: COLORS.PRIMARY,
        font: 'Arial',
      }),
    ],
    spacing: { before: spacingBefore, after: spacingAfter },
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 2,
        color: COLORS.PRIMARY,
        space: 1,
      },
    },
  });
}

// Helper function to create content paragraphs with professional styling
function createContentParagraph(text: string, spacingAfter = 400): Paragraph[] {
  const lines = text.split('\n');
  const paragraphs: Paragraph[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

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
          color: COLORS.PRIMARY,
          font: 'Arial',
        }));
      } else if (part.trim()) {
        // Regular text
        textRuns.push(new TextRun({
          text: part,
          size: 22,
          color: COLORS.SECONDARY,
          font: 'Arial',
        }));
      }
    }

    paragraphs.push(new Paragraph({
      children: textRuns,
      spacing: { after: i === lines.length - 1 ? spacingAfter : 200 },
      alignment: AlignmentType.LEFT,
    }));
  }

  return paragraphs;
}

// Helper function to create report title with professional styling
function createReportTitle(title: string | string[]): Paragraph[] {
  if (typeof title === 'string') {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 32,
            color: COLORS.PRIMARY,
            font: 'Arial',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 800, before: 200 },
        border: {
          bottom: {
            style: BorderStyle.DOUBLE,
            size: 4,
            color: COLORS.ACCENT,
            space: 2,
          },
        },
      }),
    ];
  } else {
    return title.map((line, index) => new Paragraph({
      children: [
        new TextRun({
          text: line.toUpperCase(),
          bold: true,
          size: 32,
          color: COLORS.PRIMARY,
          font: 'Arial',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: index === title.length - 1 ? 800 : 200, before: index === 0 ? 200 : 0 },
      border: index === title.length - 1 ? {
        bottom: {
          style: BorderStyle.DOUBLE,
          size: 4,
          color: COLORS.ACCENT,
          space: 2,
        },
      } : undefined,
    }));
  }
}

// Helper function to create photo section with professional styling
function createPhotoSection(photoBuffer: Buffer | null): Paragraph[] {
  if (!photoBuffer) return [];

  return [
    createSectionHeader("Documentation Photographique"),
    new Paragraph({
      children: [
        new ImageRun({
          data: photoBuffer,
          transformation: {
            width: 500,
            height: 375,
          },
          type: "png",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  ];
}

// Helper function to create logo paragraph with professional styling
function createLogoParagraph(): Paragraph {
  const logoPath = path.join(process.cwd(), 'public', 'LOGO-SOUSS-MASSA-1033x308px-removebg-preview.png');
  
  if (!fs.existsSync(logoPath)) {
    // Return empty paragraph if logo doesn't exist
    return new Paragraph({ children: [] });
  }

  const logoBuffer = fs.readFileSync(logoPath);

  return new Paragraph({
    children: [
      new ImageRun({
        data: logoBuffer,
        transformation: {
          width: 250,
          height: 75,
        },
        type: "png",
      }),
    ],
    alignment: AlignmentType.LEFT,
    spacing: { after: 300 },
  });
}

// Helper function to create footer with company information
function createFooter(): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: "Document généré électroniquement - ",
        size: 18,
        color: COLORS.SECONDARY,
        italics: true,
      }),
      new TextRun({
        text: "Région Souss-Massa",
        size: 18,
        color: COLORS.PRIMARY,
        bold: true,
        italics: true,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 600, after: 200 },
  });
}

// Common function to generate report document with professional structure
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
    console.warn('Échec du chargement de la photo:', error);
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 800,
              right: 800,
              bottom: 800,
              left: 800,
            },
          },
        },
        children: [
          // Logo
          createLogoParagraph(),
          
          // Title
          ...createReportTitle(reportTitle),

          // Introduction paragraph
          new Paragraph({
            children: [
              new TextRun({
                text: "Rapport Officiel - ",
                bold: true,
                size: 20,
                color: COLORS.SECONDARY,
              }),
              new TextRun({
                text: "Ce document présente les détails techniques et administratifs de l'opération.",
                size: 20,
                color: COLORS.SECONDARY,
              }),
            ],
            spacing: { after: 400 },
            alignment: AlignmentType.JUSTIFIED,
          }),

          // Report Details Table
          createSectionHeader("Informations Détaillées"),
          createDetailsTable(data),

          // Photo Section
          ...createPhotoSection(photoBuffer),

          // Report Recipients Section
          createSectionHeader("Destinataires du Rapport"),
          ...createContentParagraph(data.recipientEmails.join("\n")),

          // Footer
          createFooter(),
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
  const team = teamMatch ? teamMatch[1].trim() : 'Non spécifié';

  // Extract dates (look for "Dates:" pattern)
  const datesMatch = description.match(/Dates:\s*([^.]+)/i);
  const dates = datesMatch ? datesMatch[1].trim() : 'Non spécifié';

  // Extract company (look for "Company:" pattern)
  const companyMatch = description.match(/Company:\s*([^.]+)/i);
  const company = companyMatch ? companyMatch[1].trim() : 'Non spécifié';

  // Create formatted description with professional labels
  const descriptionWithLabels = `**Équipe d'Intervention:** ${team}\n**Période d'Intervention:** ${dates}\n**Entreprise Prestataire:** ${company}`;

  return generateReportDoc(
    {
      ...data,
      type: "Type d'Intervention",
      typeValue: data.interventionType,
      description: descriptionWithLabels
    },
    ["RAPPORT D'INTERVENTION", "TECHNIQUE"]
  );
}

export async function generateReclamationDoc(data: ReclamationData): Promise<Buffer> {
  // Create formatted description with professional labels
  const descriptionWithLabels = `**Nature de la Réclamation:** ${data.reclamationType}\n**Date de l'Incident:** ${data.date ? new Date(data.date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Non spécifiée'}\n**Station Concernée:** ${data.stationName}\n\n**Description Détaillée:** ${data.description || 'Aucune description fournie'}`;

  return generateReportDoc(
    {
      ...data,
      type: "Catégorie",
      typeValue: data.reclamationType,
      description: descriptionWithLabels
    },
    ["RAPPORT DE RÉCLAMATION", "ET SUIVI"]
  );
}