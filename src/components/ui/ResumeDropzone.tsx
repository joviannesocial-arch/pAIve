import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, X } from 'lucide-react';

interface ResumeDropzoneProps {
    onFileSelect: (file: File) => void;
    selectedFile?: File;
    onClear?: () => void;
    className?: string;
}

export function ResumeDropzone({
    onFileSelect,
    selectedFile,
    onClear,
    className = ''
}: ResumeDropzoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            onFileSelect(file);
        }
    }, [onFileSelect]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    }, [onFileSelect]);

    if (selectedFile) {
        return (
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`relative flex items-center gap-3 p-4 bg-purple-50 rounded-xl border-2 border-purple-200 ${className}`}
            >
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                    <File className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                        {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                </div>
                {onClear && (
                    <button
                        onClick={onClear}
                        className="p-1 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-white/50"
                        aria-label="Remove file"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </motion.div>
        );
    }

    return (
        <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            animate={{
                borderColor: isDragOver ? 'rgb(139, 92, 246)' : 'rgb(196, 181, 253)',
                backgroundColor: isDragOver ? 'rgb(245, 243, 255)' : 'rgb(250, 245, 255)',
            }}
            className={`relative flex flex-col items-center justify-center p-8 
                  rounded-2xl border-2 border-dashed
                  cursor-pointer transition-colors ${className}`}
            style={{
                backgroundImage: isDragOver
                    ? 'none'
                    : `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 8px,
              rgba(139, 92, 246, 0.05) 8px,
              rgba(139, 92, 246, 0.05) 16px
            )`
            }}
        >
            <input
                type="file"
                onChange={handleFileInput}
                accept=".pdf,.doc,.docx"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Upload CV"
            />

            <motion.div
                animate={{ y: isDragOver ? -5 : 0 }}
                className="flex flex-col items-center"
            >
                <div className="flex items-center justify-center w-12 h-12 mb-3 bg-purple-100 rounded-xl">
                    <Upload className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-purple-700">CV Upload</p>
                <p className="mt-1 text-xs text-slate-500">
                    Drag & drop or click to browse
                </p>
            </motion.div>
        </motion.div>
    );
}
