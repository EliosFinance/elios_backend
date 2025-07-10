export class EmailTrackingUtils {
    static generateTrackingPixel(emailId: number): string {
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:3333';
        return `<img src="${baseUrl}/emails/tracking/opened/${emailId}" width="1" height="1" style="display:none;" />`;
    }

    static generateTrackingLink(originalUrl: string, emailId: number): string {
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:3333';
        const encodedUrl = encodeURIComponent(originalUrl);
        return `${baseUrl}/emails/tracking/clicked/${emailId}?redirect=${encodedUrl}`;
    }

    static addTrackingToHtml(htmlContent: string, emailId: number): string {
        // Ajouter le pixel de tracking
        const trackingPixel = this.generateTrackingPixel(emailId);
        htmlContent = htmlContent.replace('</body>', `${trackingPixel}</body>`);

        // Modifier les liens pour le tracking
        htmlContent = htmlContent.replace(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi, (match, quote, url) => {
            if (url.startsWith('mailto:') || url.startsWith('#')) {
                return match;
            }
            const trackedUrl = this.generateTrackingLink(url, emailId);
            return match.replace(url, trackedUrl);
        });

        return htmlContent;
    }
}
