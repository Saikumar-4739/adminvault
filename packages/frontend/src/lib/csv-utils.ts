/**
 * Generic utility for exporting JSON data to CSV and triggering a browser download.
 */
export const exportToCSV = (data: any[], fileName: string) => {
    if (!data || !data.length) {
        console.error('No data available for export');
        return;
    }

    // Extract headers from the first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvRows = [];

    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header];
            const stringVal = val === null || val === undefined ? '' : String(val);
            // Escape double quotes and wrap in quotes to handle commas within values
            const escaped = stringVal.replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');

    // Create blob and download link
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
