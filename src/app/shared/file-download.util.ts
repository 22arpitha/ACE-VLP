export function downloadFileFromUrl(options: {
  url: string;
  fileName: string;
  fileType: 'csv' | 'pdf';
}): void {
  fetch(options.url)
    .then(res => {
      if (!res.ok) {
        throw new Error(`Failed to fetch file: ${res.statusText}`);
      }
      return res.blob();
    })
    .then(blob => {
      const a = document.createElement('a');
      const mimeType = options.fileType === 'csv' ? 'text/csv' : 'application/pdf';

      const fileBlob = new Blob([blob], { type: mimeType });
      const url = URL.createObjectURL(fileBlob);
      a.href = url;
      a.download = `${options.fileName}.${options.fileType}`;
      a.style.display = 'none';

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    })
    .catch(err => {
      console.error('File download failed:', err);
      alert('Failed to export the file. Please try again.');
    });
}
