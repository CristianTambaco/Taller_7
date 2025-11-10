export interface Receta {
  id: string;
  titulo: string;
  descripcion: string;
  ingredientes: string[];
  chef_id: string;
  imagen_url?: string;
  created_at: string;
}
