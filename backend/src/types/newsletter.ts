export interface NewsletterSubscription {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  is_subscribed: boolean;
  brevo_contact_id?: string;
  subscribed_at: Date;
  unsubscribed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface SubscribeNewsletterDTO {
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface UnsubscribeNewsletterDTO {
  email: string;
}

export interface BrevoContactResponse {
  id: number;
  email: string;
  emailBlacklisted: boolean;
  smsBlacklisted: boolean;
  listIds: number[];
  attributes: {
    FIRSTNAME?: string;
    LASTNAME?: string;
    [key: string]: any;
  };
  createdAt: string;
  modifiedAt: string;
}


