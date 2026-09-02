// Placeholder until `npm run db:types` (or `db:types:url` for a self-hosted database) regenerates
// it from the real schema (never hand-edit this file). Only the template's health() function is known.
export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: {
      health: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
