export function base64ToBlob(base64: string, mimeType: string): Blob {
    try {
        // Remove potential data URL prefix
        const base64Data = base64.replace(/^data:.*,/, '');
        
        const byteCharacters = atob(base64Data);
        const byteArray = new Uint8Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
            byteArray[i] = byteCharacters.charCodeAt(i);
        }
        
        return new Blob([byteArray], { type: mimeType });
    } catch (error :any) {
        console.error('Error converting base64 to Blob:', error);
        throw new Error('Failed to convert base64 to Blob: ' + error.message);
    }
}