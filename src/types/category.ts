// Category type matching backend CategoryRequest DTO
import { UUID } from "crypto";

export interface Category {
  id?: string; // UUID, optional for creation
  name: string;
  description?: string;
  slug: string;
  imageUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
  parentId?: string; // UUID, for hierarchy
  dateCreated?: string; // ISO string from OffsetDateTime
}
