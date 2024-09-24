export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
}

export function isPublicHoliday(date: Date): boolean {
  // This is a placeholder implementation
  // You should replace this with actual public holiday logic for your region
  const publicHolidays = [
    '2023-01-01', // New Year's Day
    '2023-12-25', // Christmas Day
    // Add more public holidays as needed
  ];

  const dateString = date.toISOString().split('T')[0];
  return publicHolidays.includes(dateString);
}