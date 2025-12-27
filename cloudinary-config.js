/**
 * STELLAR ACADEMY - Cloudinary Configuration
 * Dibuat GLOBAL agar bisa diakses oleh script module di HTML.
 */

window.CLOUDINARY_CONFIG = {
    cloudName: "dvjfrrusn", 
    uploadPreset: "forumjb", 
    uploadOptions: {
        sources: ['local', 'url', 'camera'],
        multiple: false,
        clientAllowedFormats: ["png", "jpg", "jpeg", "mp4", "mp3", "pdf"],
        maxFileSize: 10485760,
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

window.getOptimizedUrl = function (url) {
    if (!url) return "";
    return url.replace("/upload/", "/upload/f_auto,q_auto/");
};

