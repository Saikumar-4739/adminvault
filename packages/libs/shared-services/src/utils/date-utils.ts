/**
 * Formats a Date object or date string into DD-MM-YYYY format.
 * Defaults to '-' as a separator.
 *
 * @param date The date to format
 * @param separator The separator to use (default: '-')
 * @returns The formatted date string, or '-' if the date is invalid/empty
 */
export const formatDate = (date: Date | string | undefined | null, separator: string = '-'): string => {
    if (!date) return '-';

    try {
        const d = new Date(date);

        // Check for invalid date
        if (isNaN(d.getTime())) return '-';

        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();

        return `${day}${separator}${month}${separator}${year}`;
    } catch (e) {
        return '-';
    }
};
