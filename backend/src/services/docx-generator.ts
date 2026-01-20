import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import ImageModule from 'docxtemplater-image-module';
import * as fs from 'fs';
import * as path from 'path';

/**
 * DocxGeneratorService - Service for generating DOCX documents from templates
 * 
 * This service handles:
 * - Loading DOCX templates from file system or base64
 * - Replacing placeholders ({{CAMPO}}) with actual values
 * - Inserting images at designated positions
 * - Populating dynamic tables with data arrays
 * 
 * Requirements: 13.1, 13.2, 13.3, 13.4
 */

// Types for the service
export interface TemplateData {
  [key: string]: string | number | boolean | Date | TableRow[] | ImageData | undefined;
}

export interface TableRow {
  [key: string]: string | number | boolean | undefined;
}

export interface ImageData {
  data: string; // base64 encoded image
  width?: number; // width in pixels
  height?: number; // height in pixels
}

export interface GeneratedDocument {
  buffer: Buffer;
  fileName: string;
}

export interface DocxGeneratorOptions {
  templatePath?: string;
  templateBase64?: string;
  outputFileName?: string;
}

/**
 * Load a DOCX template from file path
 * @param templatePath - Path to the DOCX template file
 * @returns PizZip instance with loaded template
 */
export function loadTemplateFromPath(templatePath: string): PizZip {
  const absolutePath = path.resolve(templatePath);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Template not found: ${absolutePath}`);
  }
  
  const content = fs.readFileSync(absolutePath, 'binary');
  return new PizZip(content);
}

/**
 * Load a DOCX template from base64 string
 * @param base64Content - Base64 encoded DOCX content
 * @returns PizZip instance with loaded template
 */
export function loadTemplateFromBase64(base64Content: string): PizZip {
  const binaryContent = Buffer.from(base64Content, 'base64').toString('binary');
  return new PizZip(binaryContent);
}


/**
 * Create a Docxtemplater instance from a PizZip object with image support
 * @param zip - PizZip instance with loaded template
 * @returns Configured Docxtemplater instance
 */
export function createDocxTemplater(zip: PizZip): Docxtemplater {
  // Configure image module
  const imageOpts = {
    centered: false,
    getImage: (tagValue: string) => {
      try {
        // Remove data URL prefix if present
        const base64Data = tagValue.replace(/^data:image\/\w+;base64,/, '');
        return Buffer.from(base64Data, 'base64');
      } catch (error) {
        console.error('Error processing image:', error);
        // Return empty buffer on error
        return Buffer.from('');
      }
    },
    getSize: (): [number, number] => {
      // Return default size for images (width, height in EMUs)
      // 1 EMU = 1/914400 inch
      // 400px ≈ 3.8 inches ≈ 3657600 EMUs
      return [3657600, 2743200]; // ~400x300 pixels
    }
  };

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    modules: [new ImageModule(imageOpts)],
    // Custom parser for handling undefined values gracefully
    nullGetter: () => '',
  });
  
  return doc;
}

/**
 * Replace placeholders in the template with actual values
 * Placeholders use the format {{CAMPO}} or {CAMPO}
 * 
 * @param doc - Docxtemplater instance
 * @param data - Object with key-value pairs for replacement
 * @returns The same Docxtemplater instance (for chaining)
 */
export function replacePlaceholders(
  doc: Docxtemplater,
  data: TemplateData
): Docxtemplater {
  // Process data to handle special types
  const processedData: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) {
      // Format dates as DD/MM/YYYY
      processedData[key] = formatDate(value);
    } else if (value === undefined || value === null) {
      processedData[key] = '';
    } else {
      processedData[key] = value;
    }
  }
  
  doc.setData(processedData);
  
  return doc;
}

/**
 * Format a Date object to DD/MM/YYYY string
 * @param date - Date to format
 * @returns Formatted date string
 */
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Populate dynamic tables in the template
 * Tables use loop syntax: {#items}{field1}{field2}{/items}
 * 
 * @param doc - Docxtemplater instance
 * @param tableName - Name of the table loop in the template
 * @param rows - Array of row data objects
 * @returns The same Docxtemplater instance (for chaining)
 */
export function populateTable(
  doc: Docxtemplater,
  tableName: string,
  rows: TableRow[]
): Docxtemplater {
  const data: Record<string, TableRow[]> = {
    [tableName]: rows
  };
  
  doc.setData(data);
  
  return doc;
}

/**
 * Prepare image data for insertion into the document
 * Note: For full image support, docxtemplater-image-module is needed
 * This function prepares the data structure for image insertion
 * 
 * @param imageBase64 - Base64 encoded image data
 * @param width - Optional width in pixels
 * @param height - Optional height in pixels
 * @returns ImageData object ready for template insertion
 */
export function prepareImageData(
  imageBase64: string,
  width?: number,
  height?: number
): ImageData {
  // Remove data URL prefix if present
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  
  return {
    data: cleanBase64,
    width: width || 400,
    height: height || 300
  };
}


/**
 * Render the document with all data applied
 * @param doc - Docxtemplater instance with data set
 * @returns The same Docxtemplater instance after rendering
 */
export function renderDocument(doc: Docxtemplater): Docxtemplater {
  try {
    doc.render();
  } catch (error) {
    // Handle template errors
    if (error instanceof Error) {
      const templateError = error as { properties?: { errors?: unknown[] } };
      if (templateError.properties?.errors) {
        const errorMessages = templateError.properties.errors
          .map((e: unknown) => {
            const err = e as { message?: string };
            return err.message || 'Unknown error';
          })
          .join(', ');
        throw new Error(`Template rendering error: ${errorMessages}`);
      }
    }
    throw error;
  }
  
  return doc;
}

/**
 * Generate the final DOCX buffer from the rendered document
 * @param doc - Rendered Docxtemplater instance
 * @returns Buffer containing the DOCX file
 */
export function generateBuffer(doc: Docxtemplater): Buffer {
  const buf = doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9
    }
  });
  
  return buf;
}

/**
 * Save the generated document to a file
 * @param buffer - Document buffer
 * @param outputPath - Path where to save the file
 */
export function saveToFile(buffer: Buffer, outputPath: string): void {
  const absolutePath = path.resolve(outputPath);
  const dir = path.dirname(absolutePath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(absolutePath, buffer);
}

/**
 * Convert buffer to base64 string for storage
 * @param buffer - Document buffer
 * @returns Base64 encoded string
 */
export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}

/**
 * Main function to generate a DOCX document from template
 * Combines all steps: load, replace, render, generate
 * 
 * @param options - Generation options (template path or base64)
 * @param data - Data to inject into the template
 * @returns Generated document buffer and metadata
 */
export async function generateDocx(
  options: DocxGeneratorOptions,
  data: TemplateData
): Promise<GeneratedDocument> {
  // Load template
  let zip: PizZip;
  
  if (options.templatePath) {
    zip = loadTemplateFromPath(options.templatePath);
  } else if (options.templateBase64) {
    zip = loadTemplateFromBase64(options.templateBase64);
  } else {
    throw new Error('Either templatePath or templateBase64 must be provided');
  }
  
  // Create docxtemplater instance
  const doc = createDocxTemplater(zip);
  
  // Replace placeholders with data
  replacePlaceholders(doc, data);
  
  // Render the document
  renderDocument(doc);
  
  // Generate buffer
  const buffer = generateBuffer(doc);
  
  // Generate filename
  const fileName = options.outputFileName || `document_${Date.now()}.docx`;
  
  return {
    buffer,
    fileName
  };
}


/**
 * Generate a DOCX with dynamic tables
 * Useful for reports with variable-length data
 * 
 * @param options - Generation options
 * @param data - Simple field data
 * @param tables - Object with table name as key and rows as value
 * @returns Generated document buffer and metadata
 */
export async function generateDocxWithTables(
  options: DocxGeneratorOptions,
  data: TemplateData,
  tables: Record<string, TableRow[]>
): Promise<GeneratedDocument> {
  // Load template
  let zip: PizZip;
  
  if (options.templatePath) {
    zip = loadTemplateFromPath(options.templatePath);
  } else if (options.templateBase64) {
    zip = loadTemplateFromBase64(options.templateBase64);
  } else {
    throw new Error('Either templatePath or templateBase64 must be provided');
  }
  
  // Create docxtemplater instance
  const doc = createDocxTemplater(zip);
  
  // Combine data and tables
  const combinedData: Record<string, unknown> = { ...data };
  for (const [tableName, rows] of Object.entries(tables)) {
    combinedData[tableName] = rows;
  }
  
  // Set all data at once
  doc.setData(combinedData);
  
  // Render the document
  renderDocument(doc);
  
  // Generate buffer
  const buffer = generateBuffer(doc);
  
  // Generate filename
  const fileName = options.outputFileName || `document_${Date.now()}.docx`;
  
  return {
    buffer,
    fileName
  };
}

/**
 * Get list of placeholders in a template
 * Useful for debugging and validation
 * 
 * @param templatePath - Path to the template file
 * @returns Array of placeholder names found in the template
 */
export function getTemplatePlaceholders(templatePath: string): string[] {
  const zip = loadTemplateFromPath(templatePath);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });
  
  // Get the internal tags
  const tags = doc.getFullText();
  
  // Extract placeholders using regex
  const placeholderRegex = /\{([^{}]+)\}/g;
  const placeholders: string[] = [];
  let match;
  
  while ((match = placeholderRegex.exec(tags)) !== null) {
    const placeholder = match[1].trim();
    // Filter out loop syntax
    if (!placeholder.startsWith('#') && !placeholder.startsWith('/')) {
      if (!placeholders.includes(placeholder)) {
        placeholders.push(placeholder);
      }
    }
  }
  
  return placeholders;
}

/**
 * Validate that all required placeholders have data
 * 
 * @param requiredFields - Array of required field names
 * @param data - Data object to validate
 * @returns Object with isValid flag and missing fields array
 */
export function validateTemplateData(
  requiredFields: string[],
  data: TemplateData
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

// Export a class-based interface for convenience
export class DocxGeneratorService {
  private templatePath?: string;
  private templateBase64?: string;
  
  constructor(options: { templatePath?: string; templateBase64?: string }) {
    this.templatePath = options.templatePath;
    this.templateBase64 = options.templateBase64;
  }
  
  /**
   * Generate document with simple data replacement
   */
  async generate(data: TemplateData, outputFileName?: string): Promise<GeneratedDocument> {
    return generateDocx(
      {
        templatePath: this.templatePath,
        templateBase64: this.templateBase64,
        outputFileName
      },
      data
    );
  }
  
  /**
   * Generate document with tables
   */
  async generateWithTables(
    data: TemplateData,
    tables: Record<string, TableRow[]>,
    outputFileName?: string
  ): Promise<GeneratedDocument> {
    return generateDocxWithTables(
      {
        templatePath: this.templatePath,
        templateBase64: this.templateBase64,
        outputFileName
      },
      data,
      tables
    );
  }
  
  /**
   * Get placeholders from the template
   */
  getPlaceholders(): string[] {
    if (!this.templatePath) {
      throw new Error('Template path is required to get placeholders');
    }
    return getTemplatePlaceholders(this.templatePath);
  }
  
  /**
   * Validate data against required fields
   */
  validateData(requiredFields: string[], data: TemplateData): { isValid: boolean; missingFields: string[] } {
    return validateTemplateData(requiredFields, data);
  }
}

export default DocxGeneratorService;
