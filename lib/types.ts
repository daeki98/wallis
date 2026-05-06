export type Word = {
  id: string;
  wort: string;
  hochdeutsch: string;
  beispielsatz: string | null;
  region: string | null;
  added_by: string;
  created_at: string;
};

export type NewWord = Omit<Word, "id" | "created_at" | "added_by">;
