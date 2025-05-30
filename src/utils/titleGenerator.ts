function getAbbreviation(input: string): string {
  console.log(input);

  return input
    .split(" ") // Split by space
    .map((word) => word.replace(/[^a-zA-Z]/g, "")) // Remove special characters
    .filter((word) => word.length > 0) // Remove empty strings
    .map((word) => word[0].toUpperCase()) // Take first letter and capitalize
    .join("");
}

// export
export { getAbbreviation };
