export type SignatureType = {
  id: string;
  print_name: string;
  type: string;
  signature_data: string;
};

export type NoteType = {
  id: number;
  title: string;
  description?: string;
  update_time: string;
};
