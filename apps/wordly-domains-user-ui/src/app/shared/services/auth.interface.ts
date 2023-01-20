export interface AppMetadata {
  provider: string;
  providers: string[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserMetadata {}

export interface RootObject {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at: Date;
  invited_at: Date;
  phone: string;
  confirmation_sent_at: Date;
  confirmed_at: Date;
  recovery_sent_at: Date;
  last_sign_in_at: Date;
  app_metadata: AppMetadata;
  user_metadata: UserMetadata;
  identities: any[];
  created_at: Date;
  updated_at: Date;
}
