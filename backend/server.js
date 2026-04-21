import "dotenv/config";
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ─── Express setup ───────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ─── MySQL connection pool ───────────────────────────────────────────────────
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ─── AWS S3 client ───────────────────────────────────────────────────────────
const s3 = new S3Client({ region: process.env.AWS_REGION });

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Sanitises a filename and prepends an uploads/ prefix with a timestamp
 * to guarantee uniqueness in the S3 bucket.
 *
 * @param {string} filename - Original filename from the client
 * @returns {string} S3 object key, e.g. "uploads/1713700622345-my_file.png"
 */
function makeObjectKey(filename) {
  // Remove path traversal characters and replace spaces / unsafe chars
  const sanitised = filename
    .replace(/[/\\]/g, "")       // strip slashes
    .replace(/\.\./g, "")        // strip directory traversal
    .replace(/[^a-zA-Z0-9._-]/g, "_"); // keep only safe characters

  return `uploads/${Date.now()}-${sanitised}`;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Generate a pre-signed PUT URL for direct browser upload to S3
app.post("/api/presign", async (req, res) => {
  try {
    const { filename, contentType } = req.body;

    if (!filename || !contentType) {
      return res
        .status(400)
        .json({ error: "filename and contentType are required" });
    }

    const objectKey = makeObjectKey(filename);

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: objectKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return res.json({ uploadUrl, objectKey });
  } catch (err) {
    console.error("Presign error:", err);
    return res.status(500).json({ error: "Failed to generate presigned URL" });
  }
});

// Register a newly-uploaded file in the database
app.post("/api/files", async (req, res) => {
  try {
    const { filename, objectKey } = req.body;

    if (!filename || !objectKey) {
      return res
        .status(400)
        .json({ error: "filename and objectKey are required" });
    }

    await pool.execute(
      "INSERT INTO files (user_id, filename, object_key) VALUES (?, ?, ?)",
      [1, filename, objectKey]
    );

    return res.json({ status: "ok" });
  } catch (err) {
    console.error("Insert file error:", err);
    return res.status(500).json({ error: "Failed to save file record" });
  }
});

// List all files for the current user
app.get("/api/files", async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM files WHERE user_id = ? ORDER BY uploaded_at DESC",
      [1]
    );

    return res.json(rows);
  } catch (err) {
    console.error("List files error:", err);
    return res.status(500).json({ error: "Failed to retrieve files" });
  }
});

// ─── Start server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Cloud4U backend listening on http://localhost:${PORT}`);
});
