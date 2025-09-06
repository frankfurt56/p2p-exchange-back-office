/**
 * Format date string to display format
 * @param dateStr - Date string from database
 * @returns Formatted date string in dd/mm/yyyy hh:mm:ss format
 */
export const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '-'
    
    // If already in Thai timezone format, use directly
    // Otherwise, remove timezone indicator to prevent double conversion
    const cleanDateStr = dateStr.includes('+00:00') ? dateStr.replace('+00:00', '') : dateStr
    const date = new Date(cleanDateStr)
    
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(date)
}

/**
 * Format date string to display only date (without time)
 * @param dateStr - Date string from database
 * @returns Formatted date string in dd/mm/yyyy format
 */
export const formatDateOnly = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '-'
    
    // If already in Thai timezone format, use directly
    // Otherwise, remove timezone indicator to prevent double conversion
    const cleanDateStr = dateStr.includes('+00:00') ? dateStr.replace('+00:00', '') : dateStr
    const date = new Date(cleanDateStr)
    
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date)
}

/**
 * Format date string with Thai locale (short format)
 * @param dateStr - Date string from database
 * @returns Formatted date string in Thai format
 */
export const formatDateThai = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '-'
    
    // If already in Thai timezone format, use directly
    // Otherwise, remove timezone indicator to prevent double conversion
    const cleanDateStr = dateStr.includes('+00:00') ? dateStr.replace('+00:00', '') : dateStr
    const date = new Date(cleanDateStr)
    
    return new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date)
}

/**
 * Smart date formatter - automatically chooses Thai timezone field if available
 * @param record - Database record containing date fields
 * @param baseField - Base field name (e.g., 'created_at', 'updated_at')
 * @returns Formatted date string
 */
export const formatSmartDate = (record: any, baseField: string): string => {
    const thField = `${baseField}_th`
    
    // Prefer Thai timezone field if available, otherwise use base field
    const dateStr = record[thField] || record[baseField]
    
    return formatDate(dateStr)
}
