const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

let sharp = null;

try {
  // Optional but strongly recommended for Arabic OCR quality.
  sharp = require('sharp');
} catch {
  sharp = null;
}

// ======================================================
// TEXT HELPERS
// ======================================================

function cleanText(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function makeBatchId() {
  return `import_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

function normalizeOcrLanguage(language) {
  const allowed = new Set(['ara', 'eng', 'ara+eng']);
  return allowed.has(language) ? language : 'ara+eng';
}

// ======================================================
// TESSERACT
// ======================================================

async function getTesseract() {
  try {
    return require('tesseract.js');
  } catch {
    throw new Error(
      'OCR يحتاج تثبيت tesseract.js: npm i tesseract.js'
    );
  }
}

// ======================================================
// IMAGE PREPROCESSING
// ======================================================

async function preprocessImageForOcr(input, options = {}) {
  if (!sharp) return input;

  const image = sharp(input, {
    failOn: 'none',
  }).rotate();

  const metadata = await image.metadata();

  const width = Number(metadata.width || 0);
  const height = Number(metadata.height || 0);

  let pipeline = image;

  // Detect and crop large bright page area.
  if (width > 300 && height > 300) {
    try {
      const probe = await sharp(input, {
        failOn: 'none',
      })
        .rotate()
        .resize({
          width: Math.min(width, 1200),
          withoutEnlargement: true,
        })
        .removeAlpha()
        .raw()
        .toBuffer({
          resolveWithObject: true,
        });

      const pw = probe.info.width;
      const ph = probe.info.height;
      const channels = probe.info.channels;
      const data = probe.data;

      const bright = (x, y) => {
        const i = (y * pw + x) * channels;

        const r = data[i] || 0;
        const g = data[i + 1] || r;
        const b = data[i + 2] || r;

        return (r + g + b) / 3 > 145;
      };

      const rowThreshold = Math.max(
        10,
        Math.floor(pw * 0.28)
      );

      const colThreshold = Math.max(
        10,
        Math.floor(ph * 0.28)
      );

      const rowHits = [];
      const colHits = [];

      for (let y = 0; y < ph; y += 1) {
        let hits = 0;

        for (let x = 0; x < pw; x += 2) {
          hits += bright(x, y) ? 2 : 0;
        }

        if (hits >= rowThreshold) {
          rowHits.push(y);
        }
      }

      for (let x = 0; x < pw; x += 1) {
        let hits = 0;

        for (let y = 0; y < ph; y += 2) {
          hits += bright(x, y) ? 2 : 0;
        }

        if (hits >= colThreshold) {
          colHits.push(x);
        }
      }

      if (
        rowHits.length > ph * 0.35 &&
        colHits.length > pw * 0.35
      ) {
        const left = Math.max(
          0,
          Math.min(...colHits) - 8
        );

        const right = Math.min(
          pw - 1,
          Math.max(...colHits) + 8
        );

        const top = Math.max(
          0,
          Math.min(...rowHits) - 8
        );

        const bottom = Math.min(
          ph - 1,
          Math.max(...rowHits) + 8
        );

        const cropW = right - left + 1;
        const cropH = bottom - top + 1;

        if (
          cropW > pw * 0.45 &&
          cropH > ph * 0.45
        ) {
          const scaleX = width / pw;
          const scaleY = height / ph;

          const cropLeft = Math.max(
            0,
            Math.floor(left * scaleX)
          );

          const cropTop = Math.max(
            0,
            Math.floor(top * scaleY)
          );

          const cropWidth = Math.min(
            width - cropLeft,
            Math.floor(cropW * scaleX)
          );

          const cropHeight = Math.min(
            height - cropTop,
            Math.floor(cropH * scaleY)
          );

          pipeline = pipeline.extract({
            left: cropLeft,
            top: cropTop,
            width: cropWidth,
            height: cropHeight,
          });
        }
      }
    } catch (cropError) {
      console.warn(
        'OCR page-crop skipped:',
        cropError.message
      );
    }
  }

  const targetWidth = Number(
    options.targetWidth || 2400
  );

  pipeline = pipeline
    .resize({
      width: targetWidth,
      withoutEnlargement: false,
    })
    .grayscale()
    .normalize()
    .sharpen({
      sigma: 1.1,
    })
    .png({
      compressionLevel: 6,
    });

  return pipeline.toBuffer();
}

// ======================================================
// IMAGE OCR
// ======================================================

async function ocrImage(
  filePath,
  language = 'ara+eng'
) {
  const Tesseract = await getTesseract();

  const lang = normalizeOcrLanguage(language);

  const source = await fs.readFile(filePath);

  const prepared =
    await preprocessImageForOcr(source);

  const result = await Tesseract.recognize(
    prepared,
    lang
  );

  return {
    text: cleanText(
      result?.data?.text || ''
    ),

    confidence: Number(
      result?.data?.confidence || 0
    ),

    mode: 'image-ocr',
  };
}

// ======================================================
// PDF STANDARD FONTS
// ======================================================

function getPdfStandardFontDataUrl() {
  const pdfjsPackagePath =
    require.resolve(
      'pdfjs-dist/package.json'
    );

  const pdfjsRoot =
    path.dirname(pdfjsPackagePath);

  const standardFontsPath =
    path.join(
      pdfjsRoot,
      'standard_fonts'
    );

  // PDF.js requires a URL, not a Windows filesystem path.
  const normalizedPath =
    standardFontsPath
      .replace(/\\/g, '/');

  return `file:///${normalizedPath}/`;
}

// ======================================================
// PDF PAGE RENDER
// ======================================================

async function renderPdfPage(
  page,
  canvas
) {
  const viewport =
    page.getViewport({
      scale: 2.5,
    });

  canvas.width =
    Math.ceil(viewport.width);

  canvas.height =
    Math.ceil(viewport.height);

  const context =
    canvas.getContext('2d');

  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // IMPORTANT:
  // standardFontDataUrl belongs to getDocument(),
  // NOT to page.render().
  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  return canvas.toBuffer(
    'image/png'
  );
}

// ======================================================
// SCANNED PDF OCR
// ======================================================

async function ocrScannedPdf(
  filePath,
  language = 'ara+eng'
) {
  let pdfjs;

  try {
    pdfjs =
      await import(
        'pdfjs-dist/legacy/build/pdf.mjs'
      );
  } catch {
    throw new Error(
      'OCR للـPDF يحتاج pdfjs-dist: npm i pdfjs-dist'
    );
  }

  let canvasLib;

  try {
    canvasLib =
      require('@napi-rs/canvas');
  } catch {
    throw new Error(
      'تحويل صفحات PDF إلى صور يحتاج @napi-rs/canvas: npm i @napi-rs/canvas'
    );
  }

  const Tesseract =
    await getTesseract();

  const lang =
    normalizeOcrLanguage(language);

  const buffer =
    await fs.readFile(filePath);

  // ====================================================
  // IMPORTANT PDF.JS CONFIGURATION
  // ====================================================

  const standardFontDataUrl =
    getPdfStandardFontDataUrl();

  console.log(
    'PDF standardFontDataUrl:',
    standardFontDataUrl
  );

  const loadingTask =
    pdfjs.getDocument({
      data: new Uint8Array(buffer),

      standardFontDataUrl,

      useSystemFonts: false,
    });

  const pdf =
    await loadingTask.promise;

  console.log(
    'PDF loaded successfully:',
    pdf.numPages,
    'pages'
  );

  const pages = [];

  let confidenceTotal = 0;

  // ====================================================
  // PROCESS EACH PAGE
  // ====================================================

  for (
    let pageNumber = 1;
    pageNumber <= pdf.numPages;
    pageNumber += 1
  ) {
    console.log(
      `Processing PDF page ${pageNumber}/${pdf.numPages}`
    );

    const page =
      await pdf.getPage(
        pageNumber
      );

    const textContent =
      await page.getTextContent();

    const nativeText =
      cleanText(
        (textContent.items || [])
          .map(
            (item) =>
              item.str || ''
          )
          .join(' ')
      );

    let pageText =
      nativeText;

    let confidence = null;

    let mode =
      'pdf-text';

    // ==================================================
    // OCR ONLY WHEN NATIVE TEXT IS NOT USEFUL
    // ==================================================

    if (
      nativeText.length < 30
    ) {
      console.log(
        `Page ${pageNumber}: OCR required`
      );

      const canvas =
        canvasLib.createCanvas(
          1,
          1
        );

      const pngBuffer =
        await renderPdfPage(
          page,
          canvas
        );

      const prepared =
        await preprocessImageForOcr(
          pngBuffer
        );

      const result =
        await Tesseract.recognize(
          prepared,
          lang
        );

      pageText =
        cleanText(
          result?.data?.text ||
            ''
        );

      confidence =
        Number(
          result?.data?.confidence ||
            0
        );

      confidenceTotal +=
        confidence;

      mode =
        'pdf-page-ocr';

      console.log(
        `Page ${pageNumber}: OCR confidence ${confidence}`
      );
    } else {
      console.log(
        `Page ${pageNumber}: native PDF text`
      );
    }

    pages.push({
      page: pageNumber,
      text: pageText,
      confidence,
      mode,
    });
  }

  // ====================================================
  // COMBINE TEXT
  // ====================================================

  const text =
    cleanText(
      pages
        .map(
          (item) =>
            `\n[PAGE ${item.page}]\n${item.text}`
        )
        .join('\n')
    );

  const ocrPages =
    pages.filter(
      (p) =>
        p.confidence !== null
    );

  return {
    text,

    pageCount:
      pdf.numPages,

    pages,

    mode:
      pages.some(
        (p) =>
          p.mode ===
          'pdf-page-ocr'
      )
        ? 'pdf-page-ocr'
        : 'pdf-text',

    confidence:
      ocrPages.length > 0
        ? Number(
            (
              confidenceTotal /
              ocrPages.length
            ).toFixed(2)
          )
        : null,
  };
}

// ======================================================
// PDF TEXT EXTRACTION
// ======================================================

async function extractPdfText(
  filePath,
  ocrLanguage = 'ara+eng'
) {
  return ocrScannedPdf(
    filePath,
    ocrLanguage
  );
}

// ======================================================
// DOCUMENT TEXT EXTRACTION
// ======================================================

async function extractDocumentText({
  filePath,
  mimeType,
  ocrLanguage,
}) {
  const ext =
    path
      .extname(filePath)
      .toLowerCase();

  const isPdf =
    mimeType ===
      'application/pdf' ||
    ext === '.pdf';

  const isImage =
    /^image\//i.test(
      mimeType || ''
    ) ||
    [
      '.png',
      '.jpg',
      '.jpeg',
      '.webp',
      '.bmp',
      '.tif',
      '.tiff',
    ].includes(ext);

  if (isPdf) {
    return extractPdfText(
      filePath,
      ocrLanguage ||
        'ara+eng'
    );
  }

  if (isImage) {
    return ocrImage(
      filePath,
      ocrLanguage ||
        'ara+eng'
    );
  }

  throw new Error(
    'نوع الملف غير مدعوم. استخدم PDF أو PNG/JPG/WebP/BMP/TIFF.'
  );
}

// ======================================================
// BUILD IMPORT PAYLOAD
// ======================================================

async function buildDocumentImportPayload({
  filePath,
  mimeType,
  originalName,
  ocrLanguage = 'ara+eng',
  defaults = {},
  answerKeyText = '',
}) {
  const extracted =
    await extractDocumentText({
      filePath,
      mimeType,
      ocrLanguage,
    });

  if (!extracted.text) {
    throw new Error(
      'لم يتم استخراج نص من الملف. تأكد من وضوح الصفحات أو استخدم ملفًا بجودة أعلى.'
    );
  }

  const batchId =
    makeBatchId();

  const pages =
    extracted.pages || [];

  return {
    success: true,

    importBatchId:
      batchId,

    extraction: {
      mode:
        extracted.mode,

      confidence:
        extracted.confidence ??
        null,

      pageCount:
        extracted.pageCount ??
        (pages.length || 1),

      ocrLanguage:
        normalizeOcrLanguage(
          ocrLanguage
        ),

      pages:
        pages.map(
          (p) => ({
            page: p.page,
            confidence:
              p.confidence,
            mode: p.mode,
            textLength:
              p.text.length,
          })
        ),
    },

    questionsText:
      extracted.text,

    answerKeyText:
      cleanText(
        answerKeyText
      ),

    sourceDocument: {
      fileName:
        originalName ||
        path.basename(
          filePath
        ),

      fileUrl: '',

      pages:
        extracted.pageCount
          ? Array.from(
              {
                length:
                  extracted.pageCount,
              },
              (_, i) =>
                i + 1
            )
          : [1],

      referenceText: '',

      curriculumOnly:
        true,
    },

    defaults,
  };
}

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  extractDocumentText,
  buildDocumentImportPayload,
  ocrImage,
  ocrScannedPdf,
  preprocessImageForOcr,
};