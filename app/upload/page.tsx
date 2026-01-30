"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";

interface UploadedFile {
  file: File;
  id: string;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substring(7),
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);

    try {
      for (const fileItem of files) {
        if (fileItem.status === "success") continue;

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: "uploading" } : f
          )
        );

        const formData = new FormData();
        formData.append("file", fileItem.file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: "success" } : f
          )
        );
      }

      // Redirect to intake form with uploaded files
      router.push("/intake");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      setFiles((prev) =>
        prev.map((f) =>
          f.status === "uploading"
            ? { ...f, status: "error", error: errorMessage }
            : f
        )
      );
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">
            Please sign in to upload documents
          </p>
          <Button className="mt-4" onClick={() => router.push("/login")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        Upload Your Documents
      </h1>

      <div
        {...getRootProps()}
        className={`mb-8 cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-lg text-gray-600">
          {isDragActive
            ? "Drop the files here..."
            : "Drag & drop files here, or click to select"}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Supported formats: PDF, DOCX, TXT
        </p>
      </div>

      {files.length > 0 && (
        <div className="mb-8 space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Uploaded Files
          </h2>
          {files.map((fileItem) => (
            <div
              key={fileItem.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {fileItem.file.name}
                </p>
                <p className="text-sm text-gray-500">
                  {(fileItem.file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {fileItem.status === "uploading" && (
                  <span className="text-sm text-blue-600">Uploading...</span>
                )}
                {fileItem.status === "success" && (
                  <span className="text-sm text-green-600">✓ Uploaded</span>
                )}
                {fileItem.status === "error" && (
                  <span className="text-sm text-red-600">
                    Error: {fileItem.error}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(fileItem.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          size="lg"
        >
          {uploading ? "Uploading..." : "Continue to Project Details"}
        </Button>
      </div>
    </div>
  );
}
