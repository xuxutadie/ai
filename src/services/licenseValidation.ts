export interface LicenseCode {
  code: string;
  createdAt: string;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: string;
}

export interface LicenseData {
  version: string;
  generatedAt: string;
  totalCodes: number;
  codes: LicenseCode[];
}

export function validateLicenseCode(code: string, licenseData: LicenseData): { valid: boolean; message: string } {
  const normalizedCode = code.toUpperCase().trim();

  const foundCode = licenseData.codes.find(c => c.code === normalizedCode);

  if (!foundCode) {
    return { valid: false, message: '无效的授权码' };
  }

  if (foundCode.isUsed) {
    return { valid: false, message: '该授权码已被使用' };
  }

  return { valid: true, message: '授权码有效' };
}
