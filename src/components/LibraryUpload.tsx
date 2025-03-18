import { useState, useRef } from "react";
import {
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useLibrary } from "../contexts/LibraryContext";

const LibraryUpload = () => {
  const { uploadCSV, books, error } = useLibrary();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setUploadError("Please select a CSV file");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      await uploadCSV(file);
      setUploadSuccess(true);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setUploadError((err as Error).message || "Failed to upload CSV");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6" gutterBottom>
        Import Library
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <input
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={handleFileSelect}
          ref={fileInputRef}
          id="csv-upload"
        />
        <label htmlFor="csv-upload">
          <Button
            variant="contained"
            component="span"
            disabled={isUploading}
            color="primary"
          >
            {isUploading ? "Uploading..." : "Upload CSV"}
          </Button>
        </label>

        {isUploading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Processing CSV file...</Typography>
          </Box>
        )}

        {uploadError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {uploadError}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}

        {uploadSuccess && (
          <Alert severity="success" sx={{ mt: 1 }}>
            CSV file imported successfully!
          </Alert>
        )}

        <Typography variant="body2">
          {books.length} books in your library
        </Typography>
      </Box>
    </Box>
  );
};

export default LibraryUpload;
