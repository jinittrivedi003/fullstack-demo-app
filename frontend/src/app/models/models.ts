export interface Attachment {
  _id: string;
  originalName: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  uploadedAt: string;
}

export interface PersonalDetails {
  fullName: string;
  dateOfBirth: string;
  email: string;
  mobileNumber: string;
  address: string;
  attachments: Attachment[];
}

export interface User {
  _id: string;
  username: string;
  email: string;
  personalDetails: PersonalDetails;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}
