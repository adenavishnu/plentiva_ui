import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Category } from '@/types';
import { categoryApi } from '@/lib/api';

export interface CategoriesState {
  items: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await categoryApi.getAllCategories();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch categories';
      return rejectWithValue(message);
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async (category: Omit<Category, 'id'>, { rejectWithValue }) => {
    try {
      return await categoryApi.createCategory(category);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create category';
      return rejectWithValue(message);
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        console.log('Fetched categories:', action.payload);
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default categoriesSlice.reducer;
