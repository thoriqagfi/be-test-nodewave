import { INTERNAL_SERVER_ERROR_SERVICE_RESPONSE, ServiceResponse } from "$entities/Service";
import { FileUpload, ProcessedData } from "$entities/File";
import { FilteringQueryV2, PagedList } from "$entities/Query";
// import { buildFilterQueryLimitOffsetV2 } from "$services/helpers/FilterQueryV2";
import Logger from '$pkg/logger';
import { randomUUID } from 'crypto';

// Mock database
let filesDatabase: FileUpload[] = [];
let processedDataDatabase: ProcessedData[] = [];

export async function uploadFile(fileData: {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdBy?: string;
}): Promise<ServiceResponse<FileUpload | {}>> {
  try {
    const fileUpload: FileUpload = {
      id: randomUUID(),
      fileName: fileData.fileName,
      fileUrl: fileData.fileUrl,
      fileType: fileData.fileType,
      fileSize: fileData.fileSize,
      status: 'pending',
      uploadedAt: new Date(),
      createdBy: fileData.createdBy
    };

    // Store file record
    filesDatabase.push(fileUpload);

    // Start background processing
    processFileInBackground(fileUpload.id, fileUpload.fileSize);

    return {
      status: true,
      data: fileUpload
    };
  } catch (err) {
    Logger.error(`FileService.uploadFile : ${err}`);
    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE;
  }
}

export async function getFiles(filter: FilteringQueryV2): Promise<ServiceResponse<PagedList<FileUpload[]> | {}>> {
  try {
    // Apply filtering logic (simplified for demo)
    let filteredFiles = [...filesDatabase];

    // Apply search filters
    if (filter.searchFilters) {
      Object.keys(filter.searchFilters).forEach(key => {
        const searchValue = filter.searchFilters![key];
        if (searchValue) {
          filteredFiles = filteredFiles.filter(file =>
            (file as any)[key]?.toString().toLowerCase().includes(searchValue.toLowerCase())
          );
        }
      });
    }

    // Apply exact filters
    if (filter.filters) {
      Object.keys(filter.filters).forEach(key => {
        const filterValue = filter.filters![key];
        if (filterValue !== null && filterValue !== undefined) {
          if (Array.isArray(filterValue)) {
            filteredFiles = filteredFiles.filter(file =>
              filterValue.includes((file as any)[key])
            );
          } else {
            filteredFiles = filteredFiles.filter(file =>
              (file as any)[key] === filterValue
            );
          }
        }
      });
    }

    // Apply sorting
    if (filter.orderKey) {
      const orderRule = filter.orderRule || 'asc';
      filteredFiles.sort((a, b) => {
        const aVal = (a as any)[filter.orderKey!];
        const bVal = (b as any)[filter.orderKey!];
        if (orderRule === 'desc') {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      });
    }

    // Apply pagination
    const page = filter.page || 1;
    const rows = filter.rows || 10;
    const totalData = filteredFiles.length;
    const totalPage = Math.ceil(totalData / rows);
    const skip = (page - 1) * rows;
    const paginatedFiles = filteredFiles.slice(skip, skip + rows);

    return {
      status: true,
      data: {
        entries: paginatedFiles,
        totalData,
        totalPage
      }
    };
    } catch (err) {
      Logger.error(`FileService.getFiles : ${err}`);
      return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE;
    }
}

export async function getFileById(id: string): Promise<ServiceResponse<FileUpload | null | {}>> {
  try {
    const file = filesDatabase.find(f => f.id === id);

    if (file === undefined) {
      return {
        status: false,
        err: {
          message: "File not found",
          code: 404
        }
      };
    }

    return {
      status: true,
      data: file || null
    };
  } catch (err) {
    Logger.error(`FileService.getFileById : ${err}`);
    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE;
  }
}

export async function getFileData(fileId: string, filter: FilteringQueryV2): Promise<ServiceResponse<PagedList<ProcessedData[]> | {}>> {
  try {
    let fileData = processedDataDatabase.filter(data => data.fileId === fileId);
    if(fileData.length === 0) return { status: false, err: { message: "File not found", code: 404}}

    // Apply pagination
    const page = filter.page || 1;
    const rows = filter.rows || 10;
    const totalData = fileData.length;
    const totalPage = Math.ceil(totalData / rows);
    const skip = (page - 1) * rows;
    const paginatedData = fileData.slice(skip, skip + rows);

    return {
      status: true,
      data: {
        entries: paginatedData,
        totalData,
        totalPage
      }
    };
  } catch (err) {
    Logger.error(`FileService.getFileData : ${err}`);
    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE;
  }
}

// Background processing function
async function processFileInBackground(fileId: string, fileSize: number): Promise<void> {
  try {
    const fileIndex = filesDatabase.findIndex(f => f.id === fileId);
    if (fileIndex === -1) return;

    // Update status to processing
    filesDatabase[fileIndex].status = 'processing';

    // Mock processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock data processing - simulate reading Excel file
    const mockExcelData = generateMockExcelData(fileSize);
    filesDatabase[fileIndex].totalRows = mockExcelData.length;

    // Process each row
    for (let i = 0; i < mockExcelData.length; i++) {
      const processedRecord: ProcessedData = {
        fileId: fileId,
        rowIndex: i + 1,
        data: mockExcelData[i],
        createdAt: new Date()
      };
      processedDataDatabase.push(processedRecord);

      // Update processed rows count
      filesDatabase[fileIndex].processedRows = i + 1;

      // Simulate processing time per row
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Mark as completed
    filesDatabase[fileIndex].status = 'completed';
    filesDatabase[fileIndex].processedAt = new Date();

    Logger.info(`File ${fileId} processed successfully. ${mockExcelData.length} rows processed.`);
  } catch (err) {
    Logger.error(`Background processing failed for file ${fileId}: ${err}`);

    const fileIndex = filesDatabase.findIndex(f => f.id === fileId);

    if (fileIndex !== -1) {
      filesDatabase[fileIndex].status = 'failed';
      filesDatabase[fileIndex].errorMessage = err instanceof Error ? err.message : 'Unknown error';
      filesDatabase[fileIndex].processedAt = new Date();
    }
  }
}

// Mock data generator - replace with actual Excel processing
function generateMockExcelData(fileSize: number): Record<string, any>[] {
  const mockData = [];
  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'];
  const names = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];

  for (let i = 1; i <= fileSize; i++) {
    mockData.push({
      id: i,
      name: `${names[Math.floor(Math.random() * names.length)]} ${i}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      price: Math.floor(Math.random() * 1000) + 10,
      stock: Math.floor(Math.random() * 100) + 1,
      description: `This is a description for product ${i}`,
      createdAt: new Date(),
    });
  }

  return mockData;
}