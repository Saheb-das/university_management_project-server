type GenerateOtpOptions = {
  digit?: number;
};

export function generateOTP({ digit = 6 }: GenerateOtpOptions = {}): string {
  const min = Math.pow(10, digit - 1);
  const max = Math.pow(10, digit) - 1;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
}
