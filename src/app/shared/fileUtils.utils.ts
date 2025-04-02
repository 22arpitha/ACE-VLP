import { environment } from "../../environments/environment";

const mimeTypesMap: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.zip': 'application/zip',
    '.csv': 'text/csv',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls': 'application/vnd.ms-excel',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};


export async function urlToFile(url: string, fileName: string): Promise<File> {
    const fullUrl = `${environment.media_url}${url}`; // Use the base URL from environment variable
    const response = await fetch(fullUrl);
    const blob = await response.blob();
    const mimeType = getMimeTypeByExtension(fileName); // Default mime type if not available
    return new File([blob], fileName, { type: mimeType });
}

export async function fullUrlToFile(url: string, fileName: string): Promise<File> {
    const fullUrl = url; // Use the base URL from environment variable
    const response = await fetch(fullUrl);
    const blob = await response.blob();
    const mimeType = getMimeTypeByExtension(fileName); // Default mime type if not available
    return new File([blob], fileName, { type: mimeType });
}
// Convert File to Base64

export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result as string);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}


function getMimeTypeByExtension(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();
    if (ext && mimeTypesMap['.' + ext]) {
        return mimeTypesMap['.' + ext];
    }
    return 'application/octet-stream'; // Default MIME type
}
