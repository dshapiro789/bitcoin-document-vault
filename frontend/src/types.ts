export interface User {
  id: string;
  bitcoin_address: string;
  public_key: string;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  encrypted_content: string;
  salt: string;
  iv: string;
  created_at: string;
  updated_at: string;
}