// RDO Photos Processing Helper - Grid Layout (2 columns)
import PizZip from 'pizzip';

function escapeXml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Create image drawing XML for inline image
 */
function createImageDrawing(rid: string, photoNumber: number): string {
  // Image size: ~7cm x 5cm (2700000 x 2000000 EMUs)
  const cx = 2700000; // width in EMUs
  const cy = 2000000; // height in EMUs
  
  return `<w:r><w:rPr><w:noProof/></w:rPr><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${1000 + photoNumber}" name="Foto ${photoNumber}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name=""/><pic:cNvPicPr><a:picLocks noChangeAspect="1" noChangeArrowheads="1"/></pic:cNvPicPr></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr bwMode="auto"><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
}

/**
 * Create a table row with 1 or 2 photos in grid format
 */
function createPhotoRow(
  photo1: any, 
  rid1: string, 
  photoNum1: number,
  photo2?: any, 
  rid2?: string,
  photoNum2?: number
): string {
  const cellStyle = `<w:tcPr><w:tcW w:w="2500" w:type="pct"/><w:tcBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/></w:tcBorders><w:tcMar><w:top w:w="60" w:type="dxa"/><w:left w:w="60" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="60" w:type="dxa"/></w:tcMar><w:vAlign w:val="center"/></w:tcPr>`;
  
  let row = '<w:tr><w:trPr><w:trHeight w:val="3500"/></w:trPr>';
  
  // First cell with photo
  row += `<w:tc>${cellStyle}`;
  // Photo number
  row += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:rFonts w:ascii="Poppins" w:hAnsi="Poppins"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t>Foto ${photoNum1}</w:t></w:r></w:p>`;
  // Photo image
  row += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr>${createImageDrawing(rid1, photoNum1)}</w:p>`;
  // Description if present
  if (photo1.description || photo1.name) {
    const desc = photo1.description || photo1.name || '';
    row += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:i/><w:rFonts w:ascii="Poppins" w:hAnsi="Poppins"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr><w:t>${escapeXml(desc)}</w:t></w:r></w:p>`;
  }
  row += '</w:tc>';
  
  // Second cell (with photo or empty)
  if (photo2 && rid2 && photoNum2) {
    row += `<w:tc>${cellStyle}`;
    // Photo number
    row += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:rFonts w:ascii="Poppins" w:hAnsi="Poppins"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t>Foto ${photoNum2}</w:t></w:r></w:p>`;
    // Photo image
    row += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr>${createImageDrawing(rid2, photoNum2)}</w:p>`;
    // Description if present
    if (photo2.description || photo2.name) {
      const desc = photo2.description || photo2.name || '';
      row += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:i/><w:rFonts w:ascii="Poppins" w:hAnsi="Poppins"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr><w:t>${escapeXml(desc)}</w:t></w:r></w:p>`;
    }
    row += '</w:tc>';
  } else {
    // Empty cell
    row += `<w:tc>${cellStyle}<w:p><w:pPr><w:jc w:val="center"/></w:pPr></w:p></w:tc>`;
  }
  
  row += '</w:tr>';
  return row;
}

export async function processPhotos(
  zip: PizZip, 
  docContent: string, 
  photos: any[]
): Promise<{ zip: PizZip; docContent: string }> {
  if (!photos || photos.length === 0) {
    return { zip, docContent };
  }
  
  console.log(`📸 Processing ${photos.length} photos in GRID format...`);
  
  // Add photos to media folder and create relationships
  const relsFile = zip.file('word/_rels/document.xml.rels');
  if (!relsFile) {
    console.error('❌ document.xml.rels not found');
    return { zip, docContent };
  }
  
  let relsContent = relsFile.asText();
  
  // Find highest existing rId
  const ridMatches = relsContent.match(/Id="rId(\d+)"/g) || [];
  let maxRid = 0;
  ridMatches.forEach(match => {
    const num = parseInt(match.match(/\d+/)?.[0] || '0');
    if (num > maxRid) maxRid = num;
  });
  
  let nextRid = maxRid + 1;
  const rids: string[] = [];
  
  // Add each photo to zip and create relationship
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const photoId = `rdophoto${i + 1}`;
    const rid = `rId${nextRid}`;
    rids.push(rid);
    
    try {
      // Detect image format
      let extension = 'png';
      if (photo.data.includes('data:image/jpeg') || photo.data.includes('data:image/jpg')) {
        extension = 'jpeg';
      }
      
      const imageFileName = `${photoId}.${extension}`;
      const base64Data = photo.data.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // Add image to zip
      zip.file(`word/media/${imageFileName}`, imageBuffer);
      
      // Add relationship
      const relEntry = `<Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${imageFileName}"/>`;
      relsContent = relsContent.replace('</Relationships>', `${relEntry}</Relationships>`);
      
      console.log(`✅ Added photo ${i + 1}: ${photoId} (${rid})`);
      nextRid++;
    } catch (error) {
      console.error(`❌ Error processing photo ${i + 1}:`, error);
    }
  }
  
  // Update relationships
  zip.file('word/_rels/document.xml.rels', relsContent);
  
  // Create photo grid page with table (2 columns)
  let photosPageXml = '<w:p><w:pPr><w:pageBreakBefore/></w:pPr></w:p>';
  
  // Header
  photosPageXml += `
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:before="240" w:after="240"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:rFonts w:ascii="Poppins" w:hAnsi="Poppins"/>
          <w:sz w:val="32"/>
          <w:szCs w:val="32"/>
        </w:rPr>
        <w:t>REGISTRO FOTOGRÁFICO</w:t>
      </w:r>
    </w:p>
  `;
  
  // Create table with 2 columns
  photosPageXml += '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/></w:tblBorders><w:tblLook w:val="04A0" w:firstRow="0" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr><w:tblGrid><w:gridCol w:w="5548"/><w:gridCol w:w="5548"/></w:tblGrid>';
  
  // Add photos in pairs (2 per row)
  for (let i = 0; i < photos.length; i += 2) {
    const photo1 = photos[i];
    const rid1 = rids[i];
    const photo2 = photos[i + 1];
    const rid2 = rids[i + 1];
    
    photosPageXml += createPhotoRow(
      photo1, 
      rid1, 
      i + 1,
      photo2, 
      rid2,
      photo2 ? i + 2 : undefined
    );
  }
  
  photosPageXml += '</w:tbl>';
  
  // Insert before </w:body>
  const bodyEndPos = docContent.lastIndexOf('</w:body>');
  if (bodyEndPos !== -1) {
    docContent = docContent.substring(0, bodyEndPos) + photosPageXml + docContent.substring(bodyEndPos);
  }
  
  // Ensure content types include image types
  const contentTypesFile = zip.file('[Content_Types].xml');
  if (contentTypesFile) {
    let contentTypes = contentTypesFile.asText();
    
    if (!contentTypes.includes('Extension="png"')) {
      contentTypes = contentTypes.replace(
        '</Types>',
        '<Default Extension="png" ContentType="image/png"/></Types>'
      );
    }
    
    if (!contentTypes.includes('Extension="jpeg"')) {
      contentTypes = contentTypes.replace(
        '</Types>',
        '<Default Extension="jpeg" ContentType="image/jpeg"/></Types>'
      );
    }
    
    if (!contentTypes.includes('Extension="jpg"')) {
      contentTypes = contentTypes.replace(
        '</Types>',
        '<Default Extension="jpg" ContentType="image/jpeg"/></Types>'
      );
    }
    
    zip.file('[Content_Types].xml', contentTypes);
  }
  
  console.log(`✅ Added ${photos.length} photos in GRID format (2 columns)`);
  return { zip, docContent };
}
