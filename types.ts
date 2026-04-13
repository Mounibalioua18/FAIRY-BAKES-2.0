
export interface CakeOrder {
  customerName: string;
  phoneNumber: string;
  instagramHandle: string;
  eventDate: string;
  cakeSize: string;
  flavor: string;
  inspiration: string; // Stores base64 or filename
}

export enum FormStatus {
  IDLE = 'IDLE',
  SUBMITTING = 'SUBMITTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}