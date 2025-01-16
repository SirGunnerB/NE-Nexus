import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`http://localhost:3001/api/jobs?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch jobs');
    return response.json();
  }
);

export const fetchJob = createAsyncThunk(
  'jobs/fetchJob',
  async (id) => {
    const response = await fetch(`http://localhost:3001/api/jobs/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch job');
    return response.json();
  }
);

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData) => {
    const response = await fetch('http://localhost:3001/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(jobData)
    });
    if (!response.ok) throw new Error('Failed to create job');
    return response.json();
  }
);

export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async ({ id, jobData }) => {
    const response = await fetch(`http://localhost:3001/api/jobs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(jobData)
    });
    if (!response.ok) throw new Error('Failed to update job');
    return response.json();
  }
);

export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async (id) => {
    const response = await fetch(`http://localhost:3001/api/jobs/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete job');
    return id;
  }
);

const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    currentJob: null,
    totalJobs: 0,
    totalPages: 0,
    currentPage: 1,
    loading: false,
    error: null,
    filters: {
      status: null,
      type: null,
      experience: null,
      search: ''
    }
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: null,
        type: null,
        experience: null,
        search: ''
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch jobs
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs;
        state.totalJobs = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch single job
      .addCase(fetchJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJob.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create job
      .addCase(createJob.fulfilled, (state, action) => {
        state.jobs.unshift(action.payload);
        state.totalJobs += 1;
      })
      // Update job
      .addCase(updateJob.fulfilled, (state, action) => {
        const index = state.jobs.findIndex(job => job.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
        if (state.currentJob?.id === action.payload.id) {
          state.currentJob = action.payload;
        }
      })
      // Delete job
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter(job => job.id !== action.payload);
        state.totalJobs -= 1;
        if (state.currentJob?.id === action.payload) {
          state.currentJob = null;
        }
      });
  }
});

export const { setFilters, clearFilters } = jobSlice.actions;
export default jobSlice.reducer; 