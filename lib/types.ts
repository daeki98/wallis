export type Word = {
  id: string;
  wort: string;
  bedeutung: string;
  added_by: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};
