import express from "express";
import multer from "multer";
import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const app = express();
const port = 5000;

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/");
  },
  filename: (req, file, cb) => {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage });

// PDF extract function
const extractTextFromPDF = async (filePath) => {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await pdfjsLib.getDocument({ data }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str);
    text += strings.join(" ") + "\n";
  }

  return text;
};

// Route
app.post("/", upload.single("pdf"), async (req, res) => {
  let filePath; 

  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    filePath = req.file.path;

    console.log("Uploaded:", filePath);

    const extractedText = await extractTextFromPDF(filePath);

    console.log("Extracted:", extractedText);

    
    await fs.promises.unlink(filePath);

    return res.json({
      message: "Processed & file deleted",
      text: extractedText,
    });

  } catch (err) {
    console.error(err);

    
    if (filePath) {
      try {
        await fs.promises.unlink(filePath);
      } catch (e) {
        console.error("Delete failed:", e.message);
      }
    }

    return res.status(500).json({ error: err.message });
  }
});

// Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});