/**
 * STELLAR ACADEMY - Cloudinary Configuration
 * Pisahkan file ini agar mudah dikelola tanpa mengubah kode utama.
 */

const CLOUDINARY_CONFIG = {
    cloudName: "dvjfrrusn",    // Ganti dengan Cloud Name Anda
    uploadPreset: "forumjb",      // Ganti dengan Upload Preset Anda (Unsigned)
    
    // Opsi Tambahan untuk optimasi bandwidth
    uploadOptions: {
        sources: ['local', 'url', 'camera'],
        multiple: false,
        clientAllowedFormats: ["png", "jpg", "jpeg", "mp4", "mp3", "pdf"],
        maxFileSize: 10485760, // Batas 10MB
        styles: {
            palette: {
                window: "#050505",
                windowBorder: "#22d3ee",
                tabIcon: "#22d3ee",
                menuIcons: "#ffffff",
                textDark: "#000000",
                textLight: "#ffffff",
                link: "#22d3ee",
                action: "#22d3ee",
                inactiveTabIcon: "#475569",
                error: "#ef4444",
                inProgress: "#22d3ee",
                complete: "#22c55e",
                sourceBg: "#0f172a"
            }
        }
    }
};

// Fungsi pembantu untuk mengoptimalkan URL Cloudinary (Auto format & Quality)
function getOptimizedUrl(url) {
    if (!url) return "";
    // Menambahkan parameter f_auto (format otomatis) dan q_auto (kualitas otomatis)
    return url.replace("/upload/", "/upload/f_auto,q_auto/");
}

