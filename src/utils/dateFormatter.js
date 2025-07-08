/**
 * Formats a date string or timestamp into a more readable format.
 * Example: "2023-10-27 14:30:00" -> "Oct 27, 2023, 2:30 PM"
 * @param {string | number} dateInput - The date string or timestamp.
 * @returns {string} Formatted date string, or "Invalid Date" if input is not valid.
 */
export const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';

    const date = new Date(dateInput);

    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }

    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    };

    try {
        return new Intl.DateTimeFormat('en-US', options).format(date);
    } catch (e) {
        // Fallback for environments that might not support Intl fully for some reason
        console.error("Error formatting date with Intl:", e);
        return date.toLocaleDateString(); // Simpler fallback
    }
};

/**
 * Formats a date string or timestamp into a short date format.
 * Example: "2023-10-27 14:30:00" -> "10/27/2023"
 * @param {string | number} dateInput - The date string or timestamp.
 * @returns {string} Formatted date string, or "Invalid Date".
 */
export const formatShortDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US'); // Adjust locale as needed
};
