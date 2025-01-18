import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const submitApplication = createAsyncThunk(
  'applications/submit',
  async (formData) => {
    const response = await axios.post('/api/applications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
);

export const fetchMyApplications = createAsyncThunk(
  'applications/fetchMy',
  async () => {
    const response = await axios.get('/api/applications/my-applications');
    return response.data;
  }
);

export const fetchJobApplications = createAsyncThunk(
  'applications/fetchJob',
  async (jobId) => {
    const response = await axios.get(`/api/applications/job/${jobId}`);
    return response.data;
  }
);

export const updateApplicationStatus = createAsyncThunk(
  'applications/updateStatus',
  async ({ id, data }) => {
    const response = await axios.patch(`/api/applications/${id}`, data);
    return response.data;
  }
);

export const withdrawApplication = createAsyncThunk(
  'applications/withdraw',
  async (id) => {
    await axios.delete(`/api/applications/${id}`);
    return id;
  }
);

const applicationSlice = createSlice({
  name: 'applications',
  initialState: {
    myApplications: [],
    jobApplications: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Submit application
      .addCase(submitApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.myApplications.unshift(action.payload);
      })
      .addCase(submitApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Fetch my applications
      .addCase(fetchMyApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.myApplications = action.payload;
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Fetch job applications
      .addCase(fetchJobApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.jobApplications = action.payload;
      })
      .addCase(fetchJobApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Update application status
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const index = state.jobApplications.findIndex(app => app.id === action.payload.id);
        if (index !== -1) {
          state.jobApplications[index] = action.payload;
        }
      })

      // Withdraw application
      .addCase(withdrawApplication.fulfilled, (state, action) => {
        state.myApplications = state.myApplications.filter(app => app.id !== action.payload);
      });
  }
});

export const { clearError } = applicationSlice.actions;
export default applicationSlice.reducer; 