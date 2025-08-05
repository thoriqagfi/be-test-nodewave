export interface FileUpload {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processedRows?: number;
  totalRows?: number;
  errorMessage?: string;
  uploadedAt: Date;
  processedAt?: Date;
  createdBy?: string;
}

export interface ProcessedData {
  fileId: string;
  rowIndex: number;
  data: Record<string, any>;
  createdAt: Date;
}