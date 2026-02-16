import React, { useCallback, useState, useRef } from "react";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EditIcon from "@mui/icons-material/Edit";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { uploadApi } from "@/lib/api";

type FileType = {
  id?: string;
  url?: string;
  name?: string;
};

type UploadData = {
  id?: string;
  s3Key?: string;
  s3Url?: string;
  fileName?: string;
  [key: string]: unknown;
};

type MediaUploaderProps = {
  multiple?: boolean;
  value?: FileType[];
  onChange?: (files: FileType[]) => void;
  accept?: string;
  resetKey?: number;
};

export default function MediaUploader({
  multiple = false,
  value = [],
  onChange,
  resetKey,
}: MediaUploaderProps) {
  const [files, setFiles] = useState<FileType[]>(value);
  // Reset files when resetKey changes
  React.useEffect(() => {
    setFiles(value);
  }, [resetKey]);
  const [uploading, setUploading] = useState(false);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const handleReplaceFile = async (index: number, newFile: File) => {
    const fileToReplace = files[index];
    
    if (!fileToReplace?.id) {
      console.error('Cannot replace file without ID');
      return;
    }

    try {
      setUploading(true);
      console.log('MediaUploader: Replacing file at index', index, 'with ID:', fileToReplace.id);
      
      const res = await uploadApi.updateFile(fileToReplace.id, newFile);
      
      if (res?.success && res?.data) {
        const uploadData = res.data as UploadData;
        const updatedFile: FileType = {
          id: uploadData.id || uploadData.s3Key,
          url: uploadData.s3Url,
          name: uploadData.fileName || newFile.name,
        };
        
        const updatedFiles = [...files];
        updatedFiles[index] = updatedFile;
        
        console.log('MediaUploader: File replaced successfully:', updatedFile);
        setFiles(updatedFiles);
        if (onChange) onChange(updatedFiles);
      }
    } catch (error) {
      console.error('Failed to replace file:', error);
      alert('Failed to replace file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const uploadFiles = useCallback(async (selectedFiles: File[]) => {
    try {
      setUploading(true);

      const uploadedFiles: FileType[] = [];

      // Single file mode with existing file - UPDATE instead of new upload
      if (!multiple && files.length > 0 && files[0]?.id) {
        const existingFileId = files[0].id;
        console.log('MediaUploader: Replacing existing file:', existingFileId);
        
        const res = await uploadApi.updateFile(existingFileId, selectedFiles[0]);
        
        if (res?.success && res?.data) {
          const uploadData = res.data as UploadData;
          uploadedFiles.push({
            id: uploadData.id || uploadData.s3Key,
            url: uploadData.s3Url,
            name: uploadData.fileName || selectedFiles[0].name,
          });
        }
      } else if (multiple) {
        // Multiple files - use /api/uploads/files endpoint
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append("files", file));

        const res = await axios.post("/api/uploads/files", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Backend returns { success, message, data: { [filename]: Upload } }
                        if (res.data?.success && res.data?.data) {
                          (Object.values(res.data.data) as UploadData[]).forEach((uploadData) => {
                            if (uploadData?.s3Url) {
                              uploadedFiles.push({
                                id: uploadData.id || uploadData.s3Key,
                                url: uploadData.s3Url,
                                name: uploadData.fileName,
                              });
                            }
                          });
                        }
      } else {
        // Single file - use /api/uploads/file endpoint (new upload)
        const formData = new FormData();
        formData.append("file", selectedFiles[0]);

        const res = await axios.post("/api/uploads/file", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Backend returns { success: boolean, message: string, data: Upload }
                if (res.data?.success && res.data?.data) {
                  const uploadData = res.data.data as UploadData;
                  uploadedFiles.push({
                    id: uploadData.id || uploadData.s3Key,
                    url: uploadData.s3Url,
                    name: uploadData.fileName || selectedFiles[0].name,
                  });
                }
      }

      const updatedFiles = multiple
        ? [...files, ...uploadedFiles]
        : uploadedFiles;

      console.log('MediaUploader: Upload complete, updated files:', updatedFiles);
      setFiles(updatedFiles);
      if (onChange) onChange(updatedFiles);
    } catch (err: unknown) {
      console.error("Upload failed:", err);

      let message =
        "Upload failed. Make sure the backend server is running.";

      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message ?? err.message ?? message;
      } else if (err instanceof Error) {
        message = err.message ?? message;
      } else if (typeof err === "string") {
        message = err;
      }

      alert(message);
    } finally {
      setUploading(false);
    }
  }, [files, multiple, onChange]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      uploadFiles(acceptedFiles);
    },
    [uploadFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept: {
      "image/*": [],
      "video/*": [],
      "application/pdf": [],
    },
  });

  const handleRemove = async (index: number) => {
    const fileToRemove = files[index];
    
    // If file has an s3Key, delete it from backend
    if (fileToRemove?.id) {
      try {
        await uploadApi.deleteFile(fileToRemove.id);
        console.log("File deleted from S3:", fileToRemove.id);
      } catch (error) {
        console.error("Failed to delete file from S3:", error);
        // Continue with UI removal even if backend deletion fails
      }
    }

    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    if (onChange) onChange(updated);
  };

  return (
    <Box>
      {/* Upload Box */}
      <Box
        {...getRootProps()}
        sx={{
          border: "2px dashed",
          borderColor: isDragActive ? "primary.main" : "grey.400",
          borderRadius: 2,
          p: 3,
          textAlign: "center",
          cursor: "pointer",
          bgcolor: isDragActive ? "grey.100" : "transparent",
          transition: "0.3s",
        }}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <CircularProgress />
        ) : (
          <>
            <CloudUploadIcon fontSize="large" color="primary" />
            <Typography variant="body1" mt={1}>
              Drag & Drop or Click to Upload
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {multiple ? "Upload multiple files" : "Upload single file"}
            </Typography>
          </>
        )}
      </Box>

      {/* Preview Section */}
      <Box mt={2} display="flex" gap={2} flexWrap="wrap">
        {files.map((file, index) => (
          <Box
            key={index}
            sx={{
              position: "relative",
              width: 100,
              height: 100,
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid #ddd",
            }}
          >
            {/* Image Preview */}
            {file?.url?.match(/\.(jpeg|jpg|png|gif|webp|JPG|JPEG|PNG|GIF|WEBP)($|\?)/i) || file?.url?.includes('s3.') ? (
              <img
                src={file.url}
                alt="preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100%"
              >
                <Typography variant="caption">
                  {file.name || "File"}
                </Typography>
              </Box>
            )}

            {/* Action Buttons */}
            <Box
              sx={{
                position: "absolute",
                top: 2,
                right: 2,
                display: "flex",
                gap: 0.5,
              }}
            >
              {/* Edit Button - Show for all files with ID */}
              {file?.id && (
                <>
                  <input
                    type="file"
                    ref={(el) => { fileInputRefs.current[index] = el; }}
                    style={{ display: 'none' }}
                    title={`Replace file ${file.name || index + 1}`}
                    placeholder="Choose a file to replace"
                    aria-label={`Replace file ${file.name || index + 1}`}
                    accept="image/*,video/*,application/pdf"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) {
                        handleReplaceFile(index, selectedFile);
                      }
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => fileInputRefs.current[index]?.click()}
                    disabled={uploading}
                    sx={{
                      bgcolor: "rgba(25, 118, 210, 0.8)",
                      color: "#fff",
                      "&:hover": { bgcolor: "rgba(25, 118, 210, 0.95)" },
                      "&:disabled": { bgcolor: "rgba(0,0,0,0.3)" },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </>
              )}
              
              {/* Delete Button */}
              <IconButton
                size="small"
                onClick={() => handleRemove(index)}
                disabled={uploading}
                sx={{
                  bgcolor: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                  "&:disabled": { bgcolor: "rgba(0,0,0,0.3)" },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
